# Senior Engineering Interview: Basaar (بصائر)

> **Format:** 4 rounds × 25 questions = 100 + 5 bonus = 105 total
> **Target:** Mid→Senior candidate
> **Style:** FAANG/Big Tech — behavioral, architectural depth, system design, debugging, and coding
> **Project:** Arabic-RTL digital-book PWA transforming Dr. Haitham Talaat's apologetics work into a navigable web app — Next.js 16 / React 19, **Serwist PWA + Supabase SSR (auth, RLS bookmarks) + flexsearch + react-markdown**, 13 chapters / 522 images

---

## Round 1: Architecture & System Design (25 questions)

### Q1. Why `@serwist/next` over `next-pwa` for the service worker?

**A:** `next-pwa` (Workbox-based) is **unmaintained** for modern Next.js; Serwist is its actively-maintained successor, supports the Next 16 App Router, and ships `@serwist/next` (the webpack/turbopack wrapper) + a `defaultCache` preset (`sw.ts:1,10`). Config in `next.config.ts:4-9` via `withSerwistInit({ swSrc:'sw.ts', swDest:'public/sw.js', reloadOnOnline:true, disable: NODE_ENV!=='production' })`. The choice is forced by Next 16 compat — `next-pwa` would break. Trade-off: Serwist is newer (less battle-tested than Workbox's long history) but actively maintained and App-Router-native.

### Q2. The SW source (`sw.ts`) is 13 lines, delegating to `defaultCache`. What's gained and lost?

**A:** `sw.ts:1-13` precaches `self.__SW_MANIFEST` (build manifest injected at compile), `skipWaiting:true`+`clientsClaim:true` (instant activation), `navigationPreload:true`, `runtimeCaching: defaultCache` (Serwist's curated Next.js preset: CacheFirst/SWR for assets, NetworkFirst for navigations). **Gained**: minimal config, sane defaults, no hand-rolled route matching. **Lost**: zero custom rules — the app **adds nothing** on top of the preset, so there's no explicit offline fallback page (`setCatchHandler`), no per-route strategy, no `/api/` handling. For a content site (mostly static assets + cached navigations), the preset suffices; for an app needing fine control, you'd add custom rules. The "trust the preset" decision is defensible and minimal.

### Q3. There's no `middleware.ts`/`proxy.ts` to refresh Supabase sessions. What's the trade-off?

**A:** The audit (`docs/superpowers/plans/2026-07-03-ship-ready-audit.md:16-31`) **deleted** a `proxy.ts` as dead code. Sessions are established via `/auth/callback` and refreshed **client-side only** by `onAuthStateChange` in `AuthProvider` (`lib/supabase/auth-context.tsx:46-53`). Trade-off: simpler (no middleware), but SSR-rendered pages can't rely on a fresh server session (and indeed nothing server-side reads the session — bookmarks are client-fetched). If you ever need server-side auth-gated pages (e.g., a server-rendered profile), you'd need middleware to refresh the session cookie before the request hits the page. For this client-auth app, omitting middleware is fine.

### Q4. There are **three** Supabase clients (browser, server, route-handler). Why three?

**A:** (1) **Browser** — `lib/supabase/client.ts:4` `createBrowserClient(URL, ANON_KEY)` (manages its own cookies via the browser lib). (2) **Server** — `lib/supabase/server.ts:4` async `createClient()` using `await cookies()` from `next/headers` with `getAll`/`setAll` (`:12-19`) for SSR. (3) **Route-handler (inline)** — `app/auth/callback/route.ts:4-20` builds a `createServerClient` mirroring cookies between request and response (the **dual-cookie trick**, Q5). They're needed because each context (browser, RSC server, route handler) has different cookie access mechanics. `@supabase/ssr` exists precisely to provide these cookie-aware variants. Raw `supabase-js` wouldn't handle SSR cookies correctly.

### Q5. The auth callback uses a "dual-cookie trick." Decode it.

**A:** `app/auth/callback/route.ts:11-16` — `setAll` writes cookies to **both** `request.cookies` (so subsequent reads in the same request see them) **and** `response.cookies` (so the browser persists them on the response). This was flagged HIGH-risk during the Next 16 upgrade (`docs/upgrade-nextjs.md:39`) — without setting on the request, the cookie read later in the same handler returns stale; without setting on the response, the browser never gets it. The dual-write closes both gaps. The callback handles both PKCE `exchangeCodeForSession` and magic-link `verifyOtp({token_hash})` (`:33,39`), then redirects. This is the canonical Supabase-SSR callback pattern.

### Q6. The `bookmarks` table has RLS with 3 policies but **no UPDATE** policy. Why?

**A:** `supabase/migrations/001_create_bookmarks.sql:22-41` enables RLS + select/insert/delete policies (`auth.uid() = user_id`), no update. Reason: a bookmark is a toggle = **delete + insert** (`lib/bookmarks.ts:74,84,91`), never an update. So no UPDATE policy is needed (and no update grant). This is internally consistent design — the toggle model maps to insert/delete. If you ever needed to update a bookmark (e.g., add a note), you'd add an UPDATE policy + grant. The no-UPDATE is intentional, not an oversight.

### Q7. The migration includes explicit `GRANT` statements. Why, and what's the timely context?

**A:** `001_create_bookmarks.sql:15-19` grants `select, insert, delete to authenticated` and all to `service_role`. The comment (`:15-17`) explains: this is **required by the Supabase May 2026 Data API policy change** — PostgREST returns `42501` (insufficient privilege) for new projects after 2026-05-30 (existing projects enforced 2026-10-30). Without explicit grants, the default privileges don't allow `authenticated` to access the table via the Data API, even with RLS policies. This is a time-sensitive ADR — anyone setting up a new Supabase project now must add grants. Highly citable, current.

### Q8. Search uses flexsearch client-side on a committed 1.7 MB JSON. Why not a server search endpoint?

**A:** `public/search-data.json` (1.7 MB) is fetched lazily by `SearchDialog.tsx:42` only when the dialog opens; flexsearch is dynamically imported (`:40`) (code-split); the index is built client-side (`:46-54`). No server search endpoint. Reasons: (1) the site is SSG (no server needed for reads); (2) client search works offline (PWA); (3) no server cost. Trade-off: 1.7 MB first-search-fetch + client CPU to build the index. Mitigated by immutable 1-year cache (`next.config.ts:22-27`) + lazy load (only searchers pay). `README.md:37` wrongly claims "build-time index generation" — the index is built client-side at runtime (drift).

### Q9. `tokenize: 'forward'` in the flexsearch config. Why for Arabic?

**A:** `components/SearchDialog.tsx:46-54` — `FlexSearch.Document({ tokenize:'forward', ... })`. `forward` tokenization indexes all **prefixes** of each word (substring-friendly), so searching "كتاب" matches within "المكتبة". This suits Arabic, which uses prefixes/prefix-like attachers (الـ, وـ, بـ) that don't have spaces — a forward tokenizer catches matches inside compound forms. `strict` (whole-word) would miss prefixed forms; `full` (all substrings) is more thorough but heavier. `forward` is the pragmatic middle. `cache:true` memoizes queries.

### Q10. Chapter content is markdown rendered via react-markdown with **no `components` override**. What's the perf consequence?

**A:** `app/chapter/[slug]/page.tsx:60-62` — `<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>` with no `components` prop → default renderers → images render as **plain `<img>`**, not `next/image`. The 522 chapter images (58 MB total) ship **unoptimized** (no responsive srcset, no WebP/AVIF, no sharp). This is the single biggest perf liability — `sharp` is installed (`package.json:26`) but unused at runtime because the markdown bypasses `next/image`. Fix: add a `components={{ img: ({src, alt}) => <Image src={src} alt={alt} fill sizes="..."/> }}` override routing markdown images through `next/image`. Huge win.

### Q11. The content is extracted from a `.docx` via Python scripts. Why Python, and what's the drift?

**A:** `scripts/docx_to_md.py` (python-docx) maps Word paragraph ranges → 13 `.md` files; `inject_docx_images.py` extracts embedded images. Python is used because python-docx is mature for `.docx` (Node's `mammoth` is an alternative). **Drift**: `README.md:30-32` still says "PyMuPDF/fitz" and "ar-basaar.pdf" — the source moved from PDF to DOCX, scripts changed to python-docx, but the README wasn't updated. Also `inject_docx_images.py:10` writes to `web/public/images` (a non-existent `web/` monorepo path) — stale. And `word_diff.py:14-27` ranges **disagree** with `docx_to_md.py:8-22` (e.g., chapter-6 differs). Two scripts with inconsistent mappings.

### Q12. `--webpack` flag on dev/build. Why, given Next 16 defaults to Turbopack?

**A:** `package.json:6-7` `next dev --webpack` / `next build --webpack`. `lib/contentLoader.ts` uses Node `fs` at build time (reads markdown off disk); `docs/upgrade-nextjs.md:43-44` notes Turbopack's handling of `fs`/PostCSS needed verification, so webpack is the safe fallback. Trade-off: forgo Turbopack's speed gains for build safety. Once Turbopack's `fs` handling is confirmed stable for this use case, you could remove the flag. The flag is a deliberate "verified-working" choice, not negligence.

### Q13. The app is fully SSG. How does that interact with Supabase auth + bookmarks?

**A:** Chapters are static (`generateStaticParams` pre-renders all 13 slugs). Auth/bookmarks are **client-side only** — `AuthProvider` (client context) manages the session, `BookmarkButton` reads/writes Supabase client-side. So the static HTML ships fast (CDN-cached, no DB hit), and the dynamic auth state hydrates on the client. The only server execution is `/auth/callback` (route handler) and the (unused) server actions. This is the "static content + client-side personalization" pattern — ideal for a content site with light per-user features. `git 7c4e639` made the build prerender without Supabase env vars (client deferred to browser) so static deploys work even unconfigured.

### Q14. `BookmarkedChapters` syncs via a custom event (`bookmarks-updated`), not a global store. Explain.

**A:** `BookmarkButton.tsx:29` dispatches `window.dispatchEvent(new Event('bookmarks-updated'))` on toggle; `BookmarkedChapters.tsx:17-23` listens to both `storage` (cross-tab) and `bookmarks-updated` (same-tab) events → re-fetches the list. This is a **lightweight pub/sub** without Redux/Zustand — the bookmark button doesn't know who renders the list; it just shouts. Trade-off: simple, no store boilerplate, but it's stringly-typed (`'bookmarks-updated'`) and global (any listener can intercept). At this scale (one producer, one consumer), it's pragmatic. A store would be cleaner if many components needed bookmark state.

### Q15. Bookmarks use a write-through + offline-queue pattern. Walk through `writeThroughToggle`.

**A:** `lib/bookmarks.ts:64` — optimistic: immediately write to local storage (`STORAGE_KEY`/`CACHE_KEY`) and update UI; then `await` Supabase. On Supabase success, mirror to cache. On failure, queue to `PENDING_SYNC_KEY` (`:93`) for later retry. `syncPendingBookmarks` (`:121`) runs on login/reconnect, `upsert(...,{onConflict:'user_id,chapter_id'})` each pending item (idempotent via the unique constraint). `mergeLocalToSupabase` (`:142`) moves anonymous (`STORAGE_KEY`) entries into the user's account on sign-in, then clears the anonymous store. This is robust offline-first sync — survives flaky networks, dedupes, and merges anonymous→authed.

### Q16. The `AuthProvider` creates the Supabase client lazily in a `useRef`, only in the browser. Why?

**A:** `lib/supabase/auth-context.tsx:32-36` — `const clientRef = useRef<SupabaseClient | null>(null)`; `if (!clientRef.current && typeof window !== 'undefined') clientRef.current = createBrowserClient(...)`. This is the `git 7c4e639` fix: creating the client during SSR/SSG would read `NEXT_PUBLIC_SUPABASE_*` env vars which may be unset at build → crash the prerender. Deferring to browser-only (the `typeof window` guard) means the static build doesn't need Supabase configured. Trade-off: the client is null during SSR (auth state unknown server-side) — acceptable since nothing server-side reads it (Q3).

### Q17. `reloadOnOnline: true` in the Serwist config. What's the UX?

**A:** `next.config.ts:7` — when connectivity returns (browser fires `online`), Serwist reloads the page so the user gets fresh content. Aggressive freshness at the cost of **discarding in-memory UI state** (scroll position, open dialogs, form input). For a reading app, a mid-read reload on reconnect is jarring. Trade-off: guaranteed-fresh content vs UX continuity. An alternative: SWR (stale-while-revalidate) silently updating without a full reload. The choice depends on how stale-tolerant the content is; for a book that rarely changes, `reloadOnOnline` may be over-aggressive.

### Q18. `skipWaiting` + `clientsClaim` are both true. What does that imply for deploys?

**A:** `sw.ts:7-8` — a new SW activates **immediately** on the next navigation (doesn't wait for all tabs to close). Implication: when you deploy, users get the new version ASAP — good for freshness/bugfixes. Risk: **version skew mid-session** — a user mid-chapter could get new HTML/JS swapped in, potentially breaking in-flight state if the data shape changed. For a content site with stable data, low risk; for an app with breaking migrations, you'd use `prompt` (ask the user) instead. The choice favors freshness; acceptable here.

### Q19. There's no CSP header. Why, and what would you do?

**A:** `next.config.ts:12-29` adds `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY` but **intentionally omits CSP** — the inline anti-FOUC theme script (`app/layout.tsx:39-41`) would need `'unsafe-inline'`, defeating CSP's value. Documented as a known limitation (`docs/superpowers/plans/2026-07-03-ship-ready-audit.md:815`). To enable CSP: extract the theme script to an external file with a per-request nonce, then CSP `script-src 'self' 'nonce-<random>'` (no `unsafe-inline`). Non-trivial but the correct hardening. Currently the XFO + nosniff + RLS provide decent (not complete) protection.

### Q20. The home page imports `next/image` but doesn't use it. Dead import?

**A:** `app/page.tsx:4` imports `next/image`, but the hero uses a CSS radial gradient (`:16`), not an image. So the import is dead. Minor, but it adds bundle weight (the Image component code) for nothing. Fix: remove the import. This is the kind of dead code a lint/depcheck would catch — signals no lint gate. A senior reviewer flags it in seconds.

### Q21. How does the reading-progress bar find the scrollable parent?

**A:** `components/ReadingProgressBar.tsx:24-36` — **walks up the DOM** from the progress element to find the nearest scrollable ancestor (checking `overflow` styles), then attaches the scroll listener there (not `window`). This matters because the chapter content scrolls within a container, not the window. `requestAnimationFrame`-throttled (`:39-49`) with `{ passive: true }` listener (`:52`) for perf. Restores scroll on mount (`:32-36`) via `localStorage` (`basaar-reading-progress`). `role="progressbar"` + `aria-valuenow/min/max` for a11y. This is sophisticated, correct scroll handling.

### Q22. The `user_data` is split across 3 localStorage keys (`STORAGE_KEY`, `CACHE_KEY`, `PENDING_SYNC_KEY`). Why?

**A:** `lib/bookmarks.ts:3-5`: `basaar-bookmarks` (anonymous source-of-truth), `basaar-bookmarks-cache` (Supabase mirror), `basaar-bookmarks-pending` (offline write-behind queue). The split separates concerns: anonymous (pre-login) vs authed-cache vs pending-sync. `getBookmarks` checks: logged-in → SELECT Supabase + mirror to cache; else → cache; else → STORAGE_KEY. The pending queue enables offline writes. Three keys is more complex than one, but each has a distinct lifecycle. A single key with tagged entries is an alternative; the three-key split is explicit and debuggable.

### Q23. `chapter/[slug]/page.tsx` strips the leading `# H1` before rendering. Why?

**A:** `app/chapter/[slug]/page.tsx:60-62` — `content.replace(/^#\s+.*$/m, '').trim()` removes the first H1 (the chapter title) because the page already renders the title as `<h1>` above (`:54`). Without stripping, you'd get **duplicate H1s** (the page's + the markdown's) — bad for SEO and heading hierarchy. The regex removes only the first H1. Edge case: if a chapter's markdown has no leading H1 or a different structure, the regex is a no-op (safe). This is a clean dedup.

### Q24. The sitemap has priority tiers (`intro` 0.9). Why differentiate?

**A:** `app/sitemap.ts:11` — `intro` gets `priority: 0.9`, others lower. `priority` hints to crawlers which pages matter most (the introduction is the entry point). It's a weak signal (Google mostly ignores `priority`), but harmless and documents intent. The sitemap lists all chapters × the base URL (`:4`, env-driven `NEXT_PUBLIC_BASE_URL`). For a 13-chapter book, the sitemap is small and complete. A senior note: `priority` is largely symbolic; `lastmod` (actual content change dates) is more impactful for crawl frequency.

### Q25. If you were rebuilding from scratch, top three changes?

**A:** (1) **Route markdown images through `next/image`** (Q10) — the 58 MB unoptimized images is the biggest perf issue; a `components` override fixes it. (2) **Reconcile the Python extraction scripts** (Q11) — fix `web/public/images` path, align `word_diff.py` ranges with `docx_to_md.py`, or replace with one script. (3) **Add CSP via nonce** (Q19) — the missing CSP is the main security gap; extract the theme script + nonce. Beyond: remove dead code (server actions, unused `next/image` import), fix the README PDF→DOCX drift, and add the `offlineFallback` to the SW (Q2). The architecture is sound (Serwist + Supabase SSR + flexsearch is a strong stack); the gaps are execution details.

---

## Round 2: React & Next.js Deep Dive (25 questions)

### Q26. `ClientShell` is a client wrapper around `{children}`. Why this pattern for the root layout?

**A:** `components/ClientShell.tsx:16` (`'use client'`) wraps `{children}` in `AuthProvider` + Navbar/Search/InstallPrompt/Footer. The root layout (`app/layout.tsx:29`) is a **server component** (for fonts, metadata, RTL, the inline theme script) — it can't host client providers directly. So it renders `<ClientShell>{children}</ClientShell>`, moving the client boundary one level down. This is the standard "server root layout + client provider shell" pattern: keep the document shell server-rendered (metadata, fonts), wrap the app in a client island for context. The `Ctrl/Cmd+K` search listener (`:19-28`) lives here too.

### Q27. `Ctrl/Cmd+K` opens the search. How is it wired, and what's the a11y concern?

**A:** `ClientShell.tsx:19-28` — a `useEffect` adding a `keydown` listener: if `(e.ctrlKey || e.metaKey) && e.key === 'k'`, `e.preventDefault()` + open search. Concern: `Ctrl+K` is a common browser/OS shortcut (focus address bar in some browsers); `preventDefault` overrides it. Also, the listener should ignore when the user is typing in a field (to not hijack). The `SearchDialog` (`:19`) handles Esc/arrow/Enter (`:109-128`) and `role="dialog" aria-modal`. The global shortcut is a power-user feature; ensure it doesn't break browser defaults unexpectedly.

### Q28. `SearchDialog` lazy-imports flexsearch and fetches the JSON only on open. Why?

**A:** `SearchDialog.tsx:40-43` — `await import('flexsearch')` (code-split the lib out of the main bundle) + `fetch('/search-data.json')` (1.7 MB). Both happen **only when the dialog opens**, not at page load. So users who never search pay zero cost (no flexsearch lib, no 1.7 MB fetch). Searchers pay it once (then cached via `cache:true` + the immutable HTTP cache). This is lazy-loading done right: defer heavy, optional features until needed. The index build (`:46-58`) runs after the fetch.

### Q29. Search results dedupe by id across the `title` and `content` fields. Why?

**A:** `SearchDialog.tsx:81-97` — flexsearch searches both `title` and `content` indexes; a chapter matching both would appear twice. The dedupe (by id) collapses to one result with the higher score. This is necessary because multi-field search returns per-field matches. The dedupe key is the chapter id (stable). Without it, the user sees duplicate entries for the same chapter. A senior note: flexsearch's `enrich:true` returns the stored doc, so the deduped result keeps full context.

### Q30. `BookmarkButton` optimistically toggles. What's the rollback on failure?

**A:** `components/BookmarkButton.tsx:12` — on click, immediately flip the local `bookmarked` state + dispatch `bookmarks-updated` (UI updates instantly). Then `await writeThroughToggle(...)`. On failure, `writeThroughToggle` queues to pending (`lib/bookmarks.ts:93`) — but the **local state stays toggled** (optimistic). So the UI shows bookmarked even if the server write failed (will retry). If the user refreshes before retry, `getBookmarks` reads cache (which has the optimistic write) → consistent. The "rollback" is implicit (pending queue retries); there's no explicit revert-to-previous on failure. For a bookmark (low-stakes), optimistic-no-revert is fine; for a payment, you'd revert.

### Q31. `Navbar` initializes `isDark` in `useEffect`, not during render. Why?

**A:** `components/Navbar.tsx:19-21` — `useEffect(() => { setIsDark(document.documentElement.classList.contains('dark')) }, [])`. Reading `classList` during render would cause hydration mismatch (server has no class, client reads localStorage via the inline script and adds it). Initializing in `useEffect` (post-hydration) avoids the mismatch — the first client render matches server (default), then the effect reads the real state. Paired with `<html suppressHydrationWarning>` + the inline theme script (`app/layout.tsx:39-41`). This is the no-FOUC pattern. The theme toggle (`Navbar.tsx:24-34`) persists to `localStorage('theme')`.

### Q32. `MobileMenu` uses `translate-x-full` for hidden state. Why that over `display:none`?

**A:** `components/MobileMenu.tsx:29` — `translate-x-full` (RTL: off-screen to the right) enables CSS **transitions** (slide in/out), vs `display:none` (instant, no animation). For a drawer, the slide is the UX. `aria-modal`/`aria-label` (`:32`) for a11y. The `translate-x-full` direction in RTL needs care (off-screen side differs LTR vs RTL) — verify it slides the correct way. This is standard mobile-drawer pattern.

### Q33. `Sidebar` is a **server component** that calls `getAllChapters()`. How does it embed a client `BookmarkedChapters`?

**A:** `components/Sidebar.tsx:5` — no `'use client'`; calls `getAllChapters()` server-side (fs read at build). It renders `<BookmarkedChapters>` (client) as a child. A server component **can render client components** — the client boundary is per-component, not global. So the static chapter list is server-rendered (SEO, no JS), and the interactive bookmarks section is a client island within it. This is the App Router's strength: mix server (static data) and client (interactivity) in the same tree.

### Q34. `AuthProvider`'s `onAuthStateChange` triggers bookmark merge + sync on `SIGNED_IN`. Walk through.

**A:** `lib/supabase/auth-context.tsx:46-52` — on `SIGNED_IN`, call `mergeLocalToSupabase()` (move anonymous bookmarks → user account) + `syncPendingBookmarks()` (push queued writes). Also an `online` event listener (`:55-56`) retries pending syncs on reconnect. So the moment a user signs in (or reconnects), their anonymous reading becomes theirs and queued writes flush. This is the offline-first auth integration. The `user`/`session` state (`AuthProvider` exposes via `useAuth()`) drives `AuthButton`/`UserMenu` UI.

### Q35. `UserMenu` calls `mergeLocalToSupabase()` on open. Why on open (not on sign-in)?

**A:** `components/UserMenu.tsx:20` — calling merge on open (in addition to `SIGNED_IN`) is belt-and-suspenders: if the `onAuthStateChange` merge missed (e.g., the event fired before the listener attached), opening the user menu re-triggers it. It's defensive — ensures the merge happens even if the event path failed. Trade-off: a redundant merge on every menu open (the merge is idempotent — anonymous store cleared after, so second merge is a no-op). The redundancy is cheap insurance.

### Q36. `AuthButton` calls `signInWithOtp({email})` directly from the browser. Is that safe?

**A:** `components/AuthButton.tsx:19` — magic-link OTP is invoked client-side. Safe because: (1) the anon key is browser-exposed but RLS-protected (only `authenticated` can read bookmarks); (2) `signInWithOtp` just sends an email — the actual session is established only when the user clicks the link (`/auth/callback` verifies). So a malicious actor can't forge a session by calling OTP — they'd need the email link. The anon key being public is by design (Supabase) — security is at RLS, not the key. `docs/supabase-setup.md:31` confirms.

### Q37. `InstallPrompt` detects iOS standalone via `navigator.standalone`. Why the special case?

**A:** `components/InstallPrompt.tsx:20` — iOS Safari doesn't fire `beforeinstallprompt` (no install prompt API); iOS users install via "Add to Home Screen" manually. `navigator.standalone === true` means the app is already installed (running as PWA on iOS). So the component hides the install prompt on iOS-standalone (already installed) and shows different guidance otherwise (instructions for iOS manual install). The `BeforeInstallPromptEvent` typing (`:6-9`) handles Chromium browsers. This is cross-browser PWA install handling — iOS is the special snowflake.

### Q38. `ErrorBoundary` wraps the chapter article. Why there specifically?

**A:** `app/chapter/[slug]/page.tsx:52,81` — `<ErrorBoundary>` wraps the `<article>` (the markdown content). If react-markdown throws (malformed markdown, a remark plugin error), the boundary catches and shows a fallback — but the rest of the page (nav, header, chapter title) stays usable. Placing the boundary around just the risky content (the rendered markdown) is precise — a whole-page boundary would hide the nav on a content error. This is thoughtful boundary placement.

### Q39. `generateStaticParams` for chapters + `generateMetadata`. How do they compose?

**A:** `app/chapter/[slug]/page.tsx:10-15` `generateStaticParams` returns the 13 chapter slugs (from `getAllChapters`) → Next pre-renders `/chapter/intro`, `/chapter/chapter-1`, etc. `generateMetadata` (`:17-30`) is async, `await params`, returns per-chapter title/description for SEO. So each static chapter page gets its own `<title>`/`<description>` (unlike new-muslim-stories which has none). This is correct SSG + per-page metadata — the content-site ideal.

### Q40. `app/layout.tsx` inlines the anti-FOUC theme script. Why inline (not a file)?

**A:** `app/layout.tsx:39-41` — an inline `<script>` reads `localStorage('theme')` + `prefers-color-scheme` and adds the `.dark` class before paint. Inline (not external) because it must run **synchronously before first paint** to prevent FOUC; an external file would be a separate request with potential delay. The trade-off (Q19): inline scripts require `'unsafe-inline'` in CSP (or a nonce), which is why this app has no CSP. The pattern is correct for FOUC prevention; the CSP tension is the cost.

### Q41. `app/page.tsx` (home) is a server component reading chapters at build. What's the rendering model?

**A:** `app/page.tsx:6` — server component, `getAllChapters()` (fs read at build) → renders hero + chapter grid. Since it's static (no dynamic data), Next pre-renders it as SSG. The hero uses a CSS gradient (`:16`, no image). The grid maps chapters to cards. Fully static, CDN-cached, zero runtime cost. This is the content-site ideal. The dead `next/image` import (`:4`) should be removed.

### Q42. `ChapterPage` computes prev/next by array index. What's the edge case?

**A:** `app/chapter/[slug]/page.tsx:41-44` — prev/next by index in the `chapters` array. Edge cases: first chapter (no prev → null/hide), last chapter (no next). The `getAllChapters` sort (intro-first, then numeric, `contentLoader.ts:49-61`) determines the order — if the sort changes, prev/next change. A `notFound()` (`:37`) handles unknown slugs. The index-based approach assumes a linear reading order (a book) — correct for this app. A non-linear structure (e.g., themed collections) would need a different nav model.

### Q43. `SearchDialog` has keyboard nav (↑↓ Enter Esc). How is focus managed?

**A:** `SearchDialog.tsx:109-128` — arrow keys move the active result, Enter navigates, Esc closes. The active index is state; the result items get `aria-selected`/visual highlight. Focus management: on open, focus the input; on close, return focus to the trigger. A full focus trap (Tab cycles within the dialog) — verify it's implemented (`MobileMenu`/`SearchDialog` should trap). `role="dialog" aria-modal` (`:140`). This is solid keyboard UX; the missing piece (per audit) is a focus trap (Tab can leave the modal).

### Q44. `Footer` is a server component with an external link. Why the `rel` attributes?

**A:** `components/Footer.tsx:6-8` — the "Who Wants to Be a Millionaire" companion link uses `target="_blank" rel="noopener noreferrer"`. `noopener` prevents the new tab from accessing `window.opener` (reverse tabnabbing); `noreferrer` prevents sending the referrer. Both are correct for external links. Being a server component is fine (no interactivity). The companion link is presumably another project by the same author.

### Q45. `reactStrictMode` — is it on, and what would it surface?

**A:** Check `next.config.ts`. If on, StrictMode (dev) double-invokes effects, surfacing: `AuthProvider`'s `onAuthStateChange` subscription cleanup (is it removed?), `ClientShell`'s keydown listener cleanup, `BookmarkButton`'s event dispatch, `ReadingProgressBar`'s scroll listener + rAF cleanup. A missing cleanup → double-subscription/double-listener in dev (visible bug). StrictMode is free dev bug-finding; verify it's enabled.

### Q46. The `SearchIndex` type is cast (`as unknown as SearchIndex`). Why the workaround?

**A:** `SearchDialog.tsx:54` — flexsearch's TypeScript types are loose/complex (the library's types don't fully capture the runtime shape). The `as unknown as SearchIndex` double-cast bypasses TS to assign the constructed index. Flagged as a type-safety item (`docs/superpowers/plans/2026-07-03-ship-ready-audit.md:566-610`). Risk: TS can't catch misuse of the index API. Mitigation: wrap flexsearch in a typed adapter module exposing a clean interface; or contribute better types to flexsearch. The cast is a known escape hatch for a loosely-typed lib.

### Q47. `extractExcerpt` windows around the match. How wide, and why?

**A:** `lib/search.ts:15-30` — builds a snippet around the match position (60/120 char context, per the digest). The window shows enough surrounding text for the user to judge relevance without showing the whole chapter. Too narrow → not enough context; too wide → bloated results. 60-120 chars is a common excerpt length. The excerpt is plain text (HTML stripped) for the result list. A senior note: highlight the match term within the excerpt (`<mark>`) for scannability.

### Q48. `app/not-found.tsx` is a custom Arabic 404. Why a server component?

**A:** `app/not-found.tsx:3` — server component, custom Arabic "page not found." Server is fine (no interactivity). Being static, it's in the precache. A 404 should be fast (user hit a dead link) and localized (Arabic audience). The custom 404 is better UX than Next's default. For SEO, a 404 should return HTTP 404 (Next does for `not-found.tsx`). Verify the 404 is reachable for unknown chapters (it is, via `notFound()` in `ChapterPage`).

### Q49. `lib/supabase/actions.ts` ("use server" signInWithMagicLink/signOut) is dead code. Why does it exist?

**A:** `lib/supabase/actions.ts:6,16` defines server actions, but grep finds **nothing imports them** — the UI uses the client-side `auth-context` methods instead. The actions were likely an earlier server-action-based auth approach, abandoned when prerender-safety moved auth client-side (`git 7c4e639`, Q13). Now dead. `lib/supabase/server.ts` (the async client) is only reachable via this dead module → also effectively dead. Cleanup: delete both. The dead code indicates an abandoned approach left un-pruned.

### Q50. `app/sitemap.ts` and `app/robots.ts` are `force-static`. Why?

**A:** `app/sitemap.ts:5` `export const dynamic = 'force-static'` (and robots `:4`) — these metadata routes don't depend on request data, so force-static ensures they're generated once at build (not per-request). For a 13-chapter book, the sitemap is small and stable. `force-static` is the right directive for build-time metadata routes. The sitemap loops locales × routes × project ids (`:13`). This is correct Next 16 metadata-route practice.

---

## Round 3: TypeScript, Data, & Build Pipeline (25 questions)

### Q51. `tsconfig` strictness — what's notable, and what's missing?

**A:** Check `tsconfig.json` for `strict: true` (likely) + any extras (`noUncheckedIndexedAccess`, etc.). The notable gap: flexsearch's loose types force the `as unknown as` cast (Q46), undermining type safety at a key boundary. A senior fix: a typed wrapper. Beyond that, the data layer (chapters from markdown) is stringly-typed (content is a raw string) — a Zod schema on front-matter would help (like new-muslim-stories should have). The RLS-backed Supabase queries are typed via the generated types (if `supabase gen types`) — verify.

### Q52. `BookmarkedChapters` returns `null` when empty. Why?

**A:** `components/BookmarkedChapters.tsx` — renders `null` (nothing) when there are no bookmarks, rather than an empty section. Reason: an empty "Bookmarks" sidebar section adds visual noise. Returning null removes it entirely until the user has bookmarks. Trade-off: the user doesn't know the feature exists until they bookmark something (discoverability). An alternative: show a muted "No bookmarks yet" hint. The null-return is a minimalist choice.

### Q53. The `bookmarks` unique constraint is `(user_id, chapter_id)`. How does it enable idempotent sync?

**A:** `001_create_bookmarks.sql` `unique(user_id, chapter_id)` + `syncPendingBookmarks` uses `upsert(...,{onConflict:'user_id,chapter_id'})` (`lib/bookmarks.ts:131-135`). The upsert + conflict target means re-syncing a pending bookmark that already exists is a no-op (not an error/duplicate). So retries (after offline) are safe — the unique constraint + onConflict make sync idempotent. Without the constraint, retries would create duplicates. This is correct schema-driven idempotency.

### Q54. `writeThroughToggle` writes to **three** localStorage keys. Trace the consistency.

**A:** `lib/bookmarks.ts:64-93` — on toggle (logged-in): write `STORAGE_KEY`/`CACHE_KEY` (optimistic), await Supabase, on success mirror `CACHE_KEY`, on failure queue `PENDING_SYNC_KEY`. The three keys can momentarily disagree (optimistic write before server confirm). `getBookmarks` (`:37`) reads in priority order (logged-in → Supabase → cache → storage), so the "latest" wins. The inconsistency window is brief (until the await resolves). For offline toggles, `STORAGE_KEY` is the source until reconnect. The multi-key design is debuggable (each key's role is clear) but requires careful ordering.

### Q55. `getAllChapters` sorts intro-first then numeric. Decode the sort.

**A:** `lib/contentLoader.ts:49-61` — sorts `intro` first (the book's introduction), then `chapter-1`, `chapter-2`, ... numerically (not lexically — `chapter-10` must come after `chapter-2`, not `chapter-1` lexically). The sort extracts the numeric suffix and compares as numbers. This is the classic "natural sort" for numbered files. Without numeric sort, `chapter-10` would sort before `chapter-2` (lexical) — wrong order. The intro-first special case reflects the book's structure.

### Q56. `getChapterData(id)` returns raw content (no parsing). Why there, not in the component?

**A:** `lib/contentLoader.ts:64-78` — `readFileSync` of the `.md`, returns the raw string. The `replace(/^#\s+.*$/m,'')` H1-strip and react-markdown rendering happen in the **page component** (`page.tsx:60-62`), not the loader. Separation: the loader is data access (fs); the component is rendering (markdown → React). This keeps the loader simple/testable (returns string) and the rendering concerns in the component. An alternative: parse in the loader (return structured data) — but react-markdown wants a string, so returning raw is fine.

### Q57. The markdown has no `rehype-sanitize`. Is that safe?

**A:** react-markdown v9 **drops raw HTML by default** (no `rehype-raw`), so `<script>` in the markdown is escaped, not rendered — safe. `rehype-sanitize` would add belt-and-suspenders, but for trusted first-party markdown (authored content, not user-generated), it's unnecessary. The XSS surface is low. The risk would rise if `rehype-raw` were added (then raw HTML renders → sanitize needed). Currently safe by react-markdown's default. The images-as-`<img>` (Q10) is a perf issue, not XSS.

### Q58. `next.config.ts:22-27` sets an immutable 1-year cache for `search-data.json`. Why so long?

**A:** `search-data.json` is content-derived (the book's text); it changes only when the book changes (rare). An immutable cache (`Cache-Control: public, max-age=31536000, immutable`) lets the browser/CDN cache it aggressively — repeat searches are instant (no re-fetch). The cache is busted by content hash (the filename changes if content changes — verify the build includes a hash, or you'd serve stale search data after a book update). For a stable book, 1-year immutable is correct. The 1.7 MB cost is paid once.

### Q59. `next.config.ts:12-29` security headers. Which, and what's missing?

**A:** Present: `X-Content-Type-Options: nosniff` (MIME sniffing), `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` (clickjacking). **Missing**: CSP (intentionally, Q19), HSTS (Strict-Transport-Security — important for HTTPS enforcement), Permissions-Policy. The XFO + nosniff + RLS provide decent protection. HSTS is the notable omission (the site is HTTPS on Vercel; HSTS would enforce it). A senior hardening: add HSTS + Permissions-Policy + (eventually) nonce-CSP.

### Q60. `pnpm-workspace.yaml` allow-lists `sharp`. Why?

**A:** `sharp` has a native postinstall (libvips). pnpm v9+ blocks native build scripts by default; the allow-list permits sharp's install. Without it, sharp installs but libvips is missing → `next/image` optimization breaks. The allow-list is required for sharp to function. This is the same pnpm supply-chain hardening as other projects. Note: sharp is currently a build-time dep for `next/image` (which the markdown bypasses, Q10), so it's installed-but-underused until images route through `next/image`.

### Q61. The `bookmarks` table uses `gen_random_uuid()` for `id`. Why uuid (not serial)?

**A:** `001_create_bookmarks.sql` `id uuid PK default gen_random_uuid()`. UUIDs: globally unique (no central counter), safe for distributed/multi-client creation (a client could generate an id offline), no enumeration (a bookmark id doesn't reveal count/order). Trade-off: larger (16 bytes vs 4 for int), slower to index (but indexed, `:44-45`). For bookmarks (created client-side, synced), UUID is the right choice — a serial id would require server-round-trip to assign. The `unique(user_id, chapter_id)` is the real key; `id` is just PK.

### Q62. The migration file is version-controlled (`supabase/migrations/`). Why is that important (vs fi-dhilal which gitignores it)?

**A:** Unlike fi-dhilal-al-quran (which gitignores `supabase/`, Q11 of that doc), bassaer commits the migration. Importance: (1) fresh clones can recreate the DB schema; (2) schema evolution is tracked (migration history); (3) team members stay aligned; (4) CI can run migrations against a test DB. The migration IS the DB contract — it must be version-controlled. fi-dhilal's gitignore is a bug; bassaer's commit is correct. This is a meaningful repo-hygiene difference between the two projects.

### Q63. `vitest.setup.ts` is a single `import '@testing-library/jest-dom/vitest'`. What does that enable?

**A:** `vitest.setup.ts:1` — jest-dom's custom matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.) for Vitest. Without it, `expect(el).toBeInTheDocument()` is undefined. The setup runs once per test run (configured in `vitest.config.ts`). jsdom env provides the DOM. This is the minimal RTL+Vitest setup. A senior note: more setup (mocking `next/navigation`, `cookies()`, Supabase) could live here, but the current minimal setup means tests mock per-file.

### Q64. The `bookmarks.test.ts` mocks `createClient` as `vi.fn()`. What does that miss?

**A:** `lib/__tests__/bookmarks.test.ts` mocks `@/lib/supabase/client`'s `createClient` → only the **localStorage fallback** paths are tested (the Supabase-backed branches are mocked away). So the logged-in toggle, pending sync, and merge paths (the actual sync logic) are **not exercised**. The tests verify the localStorage layer (good) but not the Supabase integration (gap). To test those: mock `createClient` to return a fake client with `.from().select()/insert()/delete()/upsert()` chains, asserting the right calls. The current mock is too coarse.

### Q65. The `contentLoader.test.ts` mocks `fs` and `path`. What's the subtle issue?

**A:** `lib/__tests__/contentLoader.test.ts` mocks `fs` and the file's `path` — both sides mocked consistently, so tests pass. But the test's mocked `path.resolve` may differ from the real `process.cwd()`-based path used at runtime (`contentLoader.ts:4`). So the tests verify "given this mocked fs + path, the logic works" but not "the real path resolves correctly." Integration risk: if the real path is wrong (wrong cwd), tests don't catch it. A real-fs integration test (with a fixtures dir) would cover this. Mock-heavy unit tests can mask integration issues.

### Q66. The `search.test.ts` tests only `extractExcerpt`, not flexsearch. Why?

**A:** `lib/__tests__/search.test.ts` — `extractExcerpt` is a pure function (easy to unit test). flexsearch's index/search is hard to unit test (needs the full 1.7 MB index, or a representative fixture). So the search *behavior* (flexsearch matches) is covered by e2e (`e2e/search.spec.ts`), not unit. This is a reasonable split: pure logic unit-tested, integration behavior e2e-tested. The gap: no unit test for the index *construction* logic (`SearchDialog.tsx:46-58`). A fixture-based unit test would help.

### Q67. Playwright e2e asserts SW registration + manifest. What does that verify?

**A:** `e2e/pwa.spec.ts` — asserts the manifest returns 200 (`:3`) and a service worker is registered (`:12`). This verifies the PWA is wired (manifest reachable, SW installed) — the baseline PWA health. It does **not** test offline behavior (the audit notes a missing offline e2e) — e.g., going offline and reloading to confirm cached content serves. The registration assertion is a smoke test; real offline testing needs `context.setOffline(true)` + reload + assert content. A gap worth filling.

### Q68. `playwright.config.ts` runs `pnpm build && pnpm start` as the webServer. Why build (not dev)?

**A:** `playwright.config.ts:14-18` — e2e against the **production build** (`pnpm build && pnpm start`), not dev mode. Reason: e2e should test what users experience (production build), and SW/PWA behave differently in dev (Serwist `disable: NODE_ENV!=='production'`, `next.config.ts:8` — SW only in prod). So testing PWA in dev would be meaningless (no SW). Building also catches build-time errors. Trade-off: slower test setup (full build). `reuseExistingServer: !CI` avoids rebuilding locally if a server's running.

### Q69. CI uses 1 worker + 2 retries for Playwright. Why those settings?

**A:** `playwright.config.ts:7-8` — CI: 1 worker (serial, no parallelism — CI machines may be resource-constrained and flaky parallel), 2 retries (flaky tests retry; CI environments are slower/less stable). `trace on first retry` captures a trace for debugging the failure. Locally: fully parallel (fast). These are sensible CI-vs-local trade-offs. A senior note: 1 worker is slow for many tests; if the suite grows, consider sharding.

### Q70. The build has no `prebuild`. Why (unlike salam-nextjs)?

**A:** Content is hand-authored markdown (committed), not generated from another source. The `search-data.json` is committed (not generated at build). So no data-generation step is needed — `next build` reads what's there. The Python extraction scripts (`docx_to_md.py`) are **manual** (run when the source `.docx` changes), not wired to the build. This is correct for curated content: edit `.md`, build, deploy. Contrast with salam-nextjs where `khatira_content.json` is transformed by a generator.

### Q71. The `search-data.json` is hand/externally produced, not built. What's the drift risk?

**A:** There's **no script** in `package.json` generating `search-data.json` (the README's "build-time index generation" claim is false, Q8). So the file is produced externally (manually or by an un-tracked script). Drift risk: if a chapter's markdown changes but `search-data.json` isn't regenerated, search returns stale content (missing new text, or returning removed text). Fix: a build script (`scripts/build-search-index.ts`) reading `content/chapters/*.md` + writing `public/search-data.json`, wired into `prebuild`. This closes the drift — currently the file can silently diverge from the content.

### Q72. `@supabase/ssr` vs raw `supabase-js`. What does ssr add?

**A:** `supabase-js` is the base client; `@supabase/ssr` provides **cookie-aware** `createBrowserClient`/`createServerClient` that correctly handle auth sessions across SSR hydration (the `getAll`/`setAll` cookie contract). Raw `supabase-js` doesn't manage cookies for SSR — sessions would break on refresh/navigation. `supabase-js` is a transitive peer (ssr depends on it). The ssr package is the correct choice for any Next.js App Router app with Supabase auth. This is the official, recommended setup.

### Q73. The `bookmarks` RLS policy uses `auth.uid() = user_id`. What does that guarantee?

**A:** `001_create_bookmarks.sql:26-41` — every policy (`using (auth.uid() = user_id)`) ensures a user can only select/insert/delete **their own** rows. `auth.uid()` is the authenticated user's id (from the JWT). So even though the anon key is browser-exposed, a user cannot read/write another user's bookmarks — the database enforces it. This is RLS done right. The no-UPDATE policy (Q6) + the toggle model = a user can add/remove their bookmarks but never touch others. Defense at the DB layer.

### Q74. `env.example` (or equivalent) — which vars are needed, and which are public?

**A:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (both `NEXT_PUBLIC_` → browser-exposed; safe under RLS, `docs/supabase-setup.md:31`). `NEXT_PUBLIC_BASE_URL` (optional, sitemap default). Crucially, there's **no service_role key** client-side (unlike fi-dhilal) — all client Supabase uses the anon key + RLS. The server-side operations (if any) would use a service_role key server-only. This is the secure model (vs fi-dhilal's service_role-server-only-no-RLS). The `git 7c4e639` prerender fix means the build doesn't even need these vars set.

### Q75. How would you generate Supabase types for type-safe queries?

**A:** `supabase gen types typescript --project-id <id> > src/types/supabase.ts`, then `import { Database } from '@/types/supabase'` and `createBrowserClient<Database>(...)`. Now `.from('bookmarks').select()` is typed (columns, return shapes). This catches query typos at compile time (e.g., `.from('bookmakrs')` errors). The types regenerate when the schema changes (re-run the command; some teams CI-assert types are fresh). Currently the app may not use generated types (queries are loosely typed) — adding them is a type-safety win.

---

## Round 4: Problem-Solving, Debugging & System Evolution (25 questions)

### Q76. A user's bookmarks don't appear after signing in on a new device. Diagnose.

**A:** The merge flow: on `SIGNED_IN`, `mergeLocalToSupabase()` (`lib/bookmarks.ts:142`) moves anonymous bookmarks → user account, then `getBookmarks` reads from Supabase. If bookmarks don't appear: (1) did the anonymous bookmarks exist on the new device? (No — they were on the old device.) The merge is **per-device anonymous → account**, not **cross-device sync**. The new device should pull the account's Supabase bookmarks via `getBookmarks` (logged-in branch → SELECT). If that fails: (2) is the session valid? (`onAuthStateChange` fired?) (3) Does the user have bookmarks in Supabase (did the old device sync)? (4) RLS blocking? Check Supabase logs. The likely cause: the old device never synced (offline pending), so Supabase has no bookmarks for the account.

### Q77. Search returns stale results (missing recent content edits). Diagnose.

**A:** `search-data.json` is committed/externally produced (Q71), not regenerated on content change. If a chapter's markdown was edited but `search-data.json` wasn't rebuilt, search returns the old text. Also the immutable 1-year HTTP cache (`next.config.ts:22-27`) means the browser won't re-fetch even if the file changes (unless the filename has a hash). Fix: (1) a `build-search-index` script wired to `prebuild` regenerating from `content/`; (2) content-hash the filename (`search-data.[hash].json`) so the cache busts on change. Currently both the file and the cache can be stale.

### Q78. Chapter images are huge (58 MB / 522 files). How do you fix it?

**A:** Route markdown images through `next/image`: add `components={{ img: ({src, alt}) => <Image src={src} alt={alt} fill sizes="(max-width:768px) 100vw, 768px" className="object-contain" /> }}` to the `ReactMarkdown` (`app/chapter/[slug]/page.tsx:60`). Now images get responsive `srcset`, AVIF/WebP (sharp), lazy-loading — typically 80% size reduction. The 58 MB → ~10-15 MB. Requires the image parent to be `position: relative` with dimensions. This is the single biggest perf win (Q10). Verify `next.config.ts` image config (`formats, deviceSizes`) is sane.

### Q79. The SW doesn't show a custom offline page. How do you add one?

**A:** `sw.ts` has no `setCatchHandler`/`offlineFallback`. Add: precache `/offline` (a route you create, `app/offline/page.tsx`), then in `sw.ts`: `serwist.setDefaultFallbackUrls({ 'document': '/offline' })` or a `setCatchHandler` returning the cached `/offline` for navigation failures. Then a fully-uncached deep link offline shows the offline page instead of the browser's default. Serwist supports `fallbacks` config. Test with `context.setOffline(true)` + navigate to an uncached URL. This closes the Q2 gap.

### Q80. A user reports the PWA shows an old version after a redeploy. Diagnose the SW.

**A:** `skipWaiting + clientsClaim` (`sw.ts:7-8`) should activate the new SW immediately. If not updating: (1) the precache manifest (`self.__SW_MANIFEST`) didn't change (no asset hash change) → SW sees "no update." Verify the build produced new hashed assets. (2) The browser cached `sw.js` itself (the SW file should be served with no-cache headers — check Vercel config). (3) `navigationPreload` serving stale. Debug: DevTools → Application → Service Workers. Fix: ensure `sw.js` is served no-cache + assets are content-hashed (Next does this by default). The `reloadOnOnline` (`next.config.ts:7`) should also force a reload on reconnect.

### Q81. How would you add full-text search with highlighting and ranking?

**A:** Beyond flexsearch: (1) **Highlight matches** in excerpts — `extractExcerpt` (`lib/search.ts:15`) could wrap the query term in `<mark>` (escape regex first). (2) **Ranking** — flexsearch returns matches; rank by field (title > content) + frequency. (3) For Arabic, normalize (strip harakat, unify alef) before indexing + querying (voices-of-truth's `normalizeArabic` lesson). (4) For scale, a server endpoint with Postgres FTS (Arabic config) or Meilisearch. For 13 chapters, flexsearch + highlighting is plenty. The current search works; highlighting is the main UX gap.

### Q82. The auth callback redirects to `/?error=auth_failed` on failure. Improve the UX.

**A:** `app/auth/callback/route.ts:43` — on failure, redirect home with an error query param. The home page should read `?error=auth_failed` and show a localized toast/banner ("Sign-in failed, please try again"). Currently it's unclear if the home reads the param. Fix: `ClientShell` or home reads `useSearchParams().get('error')` and surfaces a message. Also distinguish error types (expired link vs OAuth fail) for better guidance. The bare query param without UI is a half-built error path.

### Q83. `mergeLocalToSupabase` clears the anonymous store after merging. What if the merge partially fails?

**A:** `lib/bookmarks.ts:142` — moves anonymous entries → account, then clears `STORAGE_KEY`. If the Supabase insert fails mid-merge (some succeed, some fail), clearing the anonymous store **loses the un-merged ones**. Fix: only clear the successfully-merged entries (track which inserted OK), or clear only after all succeed (and on partial failure, keep the un-merged for retry). The all-or-nothing clear is a data-loss risk under partial failure. This is a subtle sync bug worth hardening.

### Q84. How would you add reading-progress sync (across devices)?

**A:** Currently `basaar-reading-progress` is localStorage-only (`lib/readingProgress.ts:1`). To sync: (1) a `reading_progress` table (user_id, chapter_id, scroll_y/section, updated_at) with RLS; (2) on scroll (debounced), upsert; (3) on chapter open, fetch the latest progress + restore scroll. Last-write-wins per chapter (per-chapter, not per-user) is fine (less contention than fi-dhilal's whole-row). The `ReadingProgressBar` already tracks scroll (Q21); wire it to Supabase. Trade-off: more Supabase writes (rate-limit consideration). This extends the personalization across devices.

### Q85. The Python scripts have stale paths (`web/public/images`). How do you fix and prevent recurrence?

**A:** `scripts/inject_docx_images.py:10` `IMAGES_OUT_DIR = 'web/public/images'` — the `web/` doesn't exist (flat layout now). Fix: `'public/images'`. Prevent recurrence: (1) the script should derive paths from `process.cwd()`/`__file__` (relative to repo root), not hardcode; (2) a CI check that the scripts run cleanly against fixtures (catch path drift); (3) align `word_diff.py:14-27` ranges with `docx_to_md.py:8-22` (they disagree, Q11). The Python scripts are un-tested, un-CI'd — that's why they rotted.

### Q86. How would you migrate the SW to add per-route strategies (e.g., NetworkFirst for `/api/`)?

**A:** Replace `runtimeCaching: defaultCache` (`sw.ts:10`) with an explicit array: `runtimeCaching: [ { urlPattern: /^https.*\/api\/.*$/, handler: 'NetworkFirst', options: { cacheName: 'api-cache' } }, { urlPattern: /\.(js|css|woff2|png|jpg|webp)$/, handler: 'CacheFirst', ... }, { urlPattern: /.*/, handler: 'NetworkFirst', options: { ... } } ]`. This gives fine control (fresh API, cached assets, network-first navigations). Serwist supports this (Workbox-style). The `defaultCache` preset is the zero-config start; customizing is the next step when defaults don't fit.

### Q87. How would you add a CSP without breaking the inline theme script?

**A:** (1) **Nonce-based**: in a server component/middleware, generate `const nonce = crypto.randomUUID()` per request, pass to the layout, add `nonce` to the inline script (`<script nonce={nonce}>`), and CSP `script-src 'self' 'nonce-${nonce}'`. Now only nonce-bearing scripts run (no `unsafe-inline`). (2) **Hash-based**: compute the SHA of the inline script's content, CSP `script-src 'self' 'sha256-<hash>'`. Either works. The nonce approach is more flexible (script content can change). Next 16 supports nonces via middleware. This enables a real CSP (Q19's gap).

### Q88. The dead `lib/supabase/actions.ts` + `server.ts` (only reachable via dead code) — how do you safely remove?

**A:** (1) grep confirms zero imports of `actions.ts` outside itself. (2) `lib/supabase/server.ts` is only imported by `actions.ts` → also dead. (3) Delete both. (4) `pnpm build && pnpm test && pnpm test:e2e` to confirm nothing breaks. (5) Add `knip`/`depcheck` to CI to catch future dead code. The risk: a server component somewhere importing `createClient` from `server.ts` directly (not via actions) — grep for `lib/supabase/server` imports to confirm only `actions.ts` uses it. If clear, delete both safely.

### Q89. How would you add a "dark mode auto" (follow system) vs explicit toggle?

**A:** The inline theme script (`app/layout.tsx:39-41`) likely already handles `prefers-color-scheme`. The `Navbar` toggle (`:24-34`) persists explicit choice. To add "auto": a 3-state toggle (light/dark/auto), where "auto" clears the stored preference and defers to `prefers-color-scheme` (the script's default). Store `'auto'|'light'|'dark'` in localStorage. The script: if stored is 'auto' or absent, use `prefers-color-scheme`; else use stored. This is the 3-state pattern (like voices-of-truth's ThemeProvider). Add a `matchMedia` listener for live system-theme changes when in auto mode.

### Q90. A contributor adds a 14th chapter but it doesn't appear. Diagnose.

**A:** `getAllChapters` (`contentLoader.ts:18`) reads `content/chapters/*.md`. If the new `.md` is there, it should appear. Causes for absence: (1) filename doesn't match the `.md` filter; (2) the regex extracting `# title` fails (no H1) → the chapter is skipped or has no title; (3) the sort places it unexpectedly (numeric suffix mismatch); (4) `search-data.json` wasn't regenerated (so search misses it, but the grid shows it); (5) the SW is serving a cached old build (no new chapter until SW updates). Debug: `console.log(getAllChapters().length)` server-side; verify the file parses.

### Q91. How would you add user annotations/notes per chapter?

**A:** (1) `annotations` table (user_id, chapter_id, selection_text, note, position, created_at) with RLS. (2) A text-selection UI (highlight text → "add note" popover). (3) Render existing annotations as highlights in the chapter (requires mapping selection → DOM range — non-trivial with react-markdown output). (4) Sync like bookmarks (optimistic + offline queue). The hard part is mapping a user's text selection to a stable position in the chapter (text offsets shift if content changes). Anchoring to a paragraph + offset is more stable than absolute position. This is a significant feature (medium lift).

### Q92. How would you test the offline bookmark write-behind queue?

**A:** Unit test `lib/bookmarks.ts`: mock `createClient` to a fake that **rejects** writes (simulating offline); call `writeThroughToggle` → assert it queues to `PENDING_SYNC_KEY`; then make the fake **resolve** + call `syncPendingBookmarks` → assert it upserts and clears the queue. E2E: `context.setOffline(true)` → bookmark a chapter → assert it's in the UI (optimistic) + in pending → `context.setOffline(false)` → assert it syncs (visible in Supabase or via re-fetch). The e2e is the real confidence-builder; the unit covers the logic. Currently the Supabase branches are untested (Q64).

### Q93. How would you add social sharing per chapter?

**A:** (1) A `<ShareButton>` (Web Share API + clipboard fallback, like salam's) on the chapter page. (2) `generateMetadata` already returns per-chapter title/description; add `openGraph.images` (a chapter OG image — could be the chapter's first image or a branded template via `@vercel/og`). (3) The share URL is the chapter's canonical (`/chapter/<slug>`). For a static site, OG images via `@vercel/og` need a server (Vercel) — fine for the SSR deploy. WhatsApp/Facebook shares then show the chapter title + image. This is straightforward; the metadata foundation exists.

### Q94. The `README.md` says "Next.js 15" badges but it's 16. How do you prevent docs version drift?

**A:** Update the badges (`README.md:19`) to Next 16. Prevent recurrence: (1) generate badges from `package.json` (shields.io supports a JSON-source badge); (2) a CI check grepping README for hardcoded version numbers and comparing to `package.json`; (3) treat docs like code — a PR bumping Next also updates README in the same PR. The "15" badge is classic rot (the upgrade happened, docs didn't follow). The meta-fix: CI asserting doc versions match package versions.

### Q95. How would you add audio narration per chapter?

**A:** (1) Source audio (a narrator's recitation of each chapter); name by slug. (2) An `<AudioPlayer>` on the chapter page. (3) Preload the current chapter; lazy-load others. (4) Sync highlighting with playback (if word-level timing is available). (5) PWA: audio is large; stream (range requests) or offer explicit download. Challenges: finding a narrator, file sizes, licensing. The book's length (900 pages) makes full narration a massive effort — maybe per-section. The audio is independent of the text pipeline.

### Q96. A teammate wants Redux for bookmark state. Respond.

**A:** Current bookmark state: `localStorage` (3 keys) + a custom event bus (`bookmarks-updated`) + `AuthProvider` triggers. It's distributed but works. Redux would centralize but add boilerplate. Ask: "What's broken?" If the event bus is fragile (stringly-typed, global), a small Zustand store (lighter than Redux) for bookmarks would clean it — `useBookmarks()` selector, no event bus. But the current system works; the lift isn't justified unless the event-bus approach causes bugs. For now, the custom-event + localStorage is adequate; Zustand is the natural upgrade if complexity grows.

### Q97. How would you add i18n (Arabic-only currently)?

**A:** The audience is Arabic readers; i18n is low-priority. If wanted: next-intl (like new-muslim-stories) or i18next. Extract Arabic UI strings, `[locale]` routing, RTL→LTR audit. The content (the book) is Arabic-only (translation is a massive scholarly effort). For a diaspora audience, English UI + Arabic content could work. Unlike a portfolio, the content defines the audience — i18n is optional. The current Arabic-only with `<html lang="ar" dir="rtl">` (`app/layout.tsx:37`) is correct for the target user.

### Q98. The three Supabase clients share URL/ANON_KEY. How do you centralize the config?

**A:** `lib/supabase/client.ts`, `server.ts`, and the inline callback client all pass `URL` + `ANON_KEY`. Centralize: `lib/supabase/config.ts` exporting `SUPABASE_URL`/`SUPABASE_ANON_KEY` (reading env once); all three import them. Or a `createClients()` factory. Currently the env read is triplicated. Centralizing prevents drift (one place to change). The callback's inline client (`app/auth/callback/route.ts:4-20`) is the most duplication-prone (it also reimplements the cookie handling) — it could reuse a factory. Minor DRY win.

### Q99. How would you add analytics (which chapters are read most)?

**A:** Privacy-friendly (Plausible/Umami): track `/chapter/<slug>` pageviews (automatic), bookmark toggles, search queries (aggregate top-N, not raw). For a book, "most-read chapters" + "drop-off points" are valuable. Client-side events (the app is SSG). Env-gate to production. Plausible is cookieless (no GDPR consent needed). The events fire client-side via the analytics SDK. Avoid logging search text (potential sensitivity). The `NEXT_PUBLIC_BASE_URL`-style env config for the analytics domain.

### Q100. Onboarding a new dev: 5-step guide?

**A:** 1. Read `AGENTS.md` + `docs/supabase-setup.md` (the Supabase schema/RLS) + `README.md` (note stale parts: PDF→DOCX, "Next 15"). 2. Set up Supabase: create project, run `supabase/migrations/001_create_bookmarks.sql`, set `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` in `.env.local`. 3. `pnpm install && pnpm dev` (note `--webpack` flag, Q12); visit `/`, open a chapter, try search (Ctrl+K). 4. Trace a chapter: `content/chapters/*.md` → `contentLoader.ts` → `chapter/[slug]/page.tsx` → react-markdown. Trace a bookmark: `BookmarkButton` → `lib/bookmarks.ts` (writeThroughToggle) → Supabase (RLS). 5. Run `pnpm test` (vitest) + `pnpm test:e2e` (Playwright, needs `pnpm build` first). Warn: README/docs drift (PDF→DOCX, "Next 15"), dead `lib/supabase/actions.ts`, images bypass `next/image` (Q10).

---

## Bonus Round: Stretch Questions (5 questions)

### Q101. The markdown images bypass `next/image` (58 MB unoptimized). Design the complete fix.

**A:** (1) Add a `components` override to `ReactMarkdown`: `img: ({src, alt, ...props}) => { const isExternal = src?.startsWith('http'); if (isExternal) return <img src={src} alt={alt} {...props} />; return <Image src={src} alt={alt} width={800} height={600} className="w-full h-auto" sizes="(max-width:768px) 100vw, 768px" /> }`. (2) For `next/image`, the parent `<p>` (react-markdown wraps images in `<p>`) needs `position: relative` or use `width`/`height` (not `fill`) to avoid layout issues — use explicit dimensions + `className="w-full h-auto"`. (3) Configure `next.config.ts` image formats (`['avif','webp']`) + deviceSizes. (4) Verify sharp is installed (it is). Result: 522 images get responsive srcset + AVIF/WebP + lazy-load — ~80% size cut. The override is the one change; test on a chapter with many images.

### Q102. The SW has no offline fallback. Design the complete offline UX.

**A:** (1) Create `app/offline/page.tsx` (a static Arabic "you're offline, cached content available" page). (2) In `sw.ts`, add `fallbacks: { document: '/offline', image: '/offline.png' }` (Serwist API) or a `setCatchHandler` returning the cached `/offline` for navigation failures. (3) Precache `/offline` in the build manifest. (4) Test: `context.setOffline(true)` → navigate to an uncached URL → assert `/offline` renders. (5) For cached chapters, offline navigation should serve the cached HTML (the precache + navigation preload handle this). The gap is only fully-uncached deep links offline. The `reloadOnOnline` (`next.config.ts:7`) reloads on reconnect. This makes the PWA robust offline end-to-end.

### Q103. Design the search-data.json regeneration to prevent staleness.

**A:** (1) `scripts/build-search-index.ts` (tsx): read `content/chapters/*.md` via `gray-matter` (strip front-matter) + plain-text extraction (strip markdown); for each chapter, `{id: slug, title, content: text}`; write `public/search-data.json`. (2) Wire into `prebuild` (`package.json`): `"prebuild": "tsx scripts/build-search-index.ts"`. (3) Content-hash the filename: write `public/search-data.[hash].json` + update the reference in `SearchDialog.tsx` (or use a manifest). This busts the immutable cache (Q58) when content changes. (4) CI asserts `search-data.json` is fresh (run the script, diff against committed, fail if changed — forces commits to include regenerated index). Now search can't drift from content.

### Q104. The auth-callback dual-cookie pattern is subtle. Explain why both writes are necessary and what breaks without each.

**A:** `app/auth/callback/route.ts:11-16` writes cookies to **both** `request.cookies` and `response.cookies`. (1) **Without the request write**: subsequent `cookies().get()` *within the same request* (after `setAll`) returns the old value — because `request.cookies` is what `next/headers` `cookies()` reads. So any auth-dependent code later in the handler sees no session. (2) **Without the response write**: the browser never receives the `Set-Cookie` header → the session isn't persisted → next navigation is unauthed. So both are necessary: request-write for same-request visibility, response-write for browser persistence. This was the HIGH-risk Next-16-upgrade bug (`docs/upgrade-nextjs.md:39`); the dual-write is the fix. Omitting either breaks auth silently.

### Q105. Docs drift is significant (PDF→DOCX, "Next 15," "build-time index"). Design a docs-freshness process.

**A:** (1) **Single source for facts** — versions, file paths, scripts: derive from `package.json`/source, don't hand-maintain in README. (2) **Generate badges** — shields.io from `package.json` (version badges auto-update). (3) **CI docs check** — a script: (a) grep README/docs for hardcoded versions, compare to `package.json`; (b) verify cited file paths exist; (c) verify claimed scripts exist in `package.json`; (d) flag known-drift patterns ("PyMuPDF", "Next 15"). (4) **Version-stamp** — "accurate as of <version>" headers; archive stale docs. (5) **PR rule** — behavior-changing PRs update docs same-PR. (6) **Audit cycle** — quarterly docs review. This repo's docs rotted (PDF→DOCX, version, search claims) because nothing enforced freshness; the fix is process + CI, not one-off edits.

---

## Evaluation Criteria

| Area | Mid | Senior | Staff |
|------|-----|--------|-------|
| **Architecture** | Explains SSG + client-auth split | Debates SW defaultCache vs custom | Designs the markdown→next/image + offline-fallback |
| **React/Next** | Identifies server/client components | Diagnoses `AuthProvider` lazy-client fix | Designs the auth-callback dual-cookie correctly |
| **Supabase** | Knows RLS basics | Explains the 3 clients + no-middleware trade-off | Designs reading-progress sync + idempotent upserts |
| **PWA** | Knows what a SW does | Diagnoses skipWaiting/clientsClaim deploy behavior | Designs per-route SW strategies + offline fallback |
| **Search** | Explains flexsearch client-side | Diagnoses search-data staleness | Designs the build-search-index + cache-busting |
| **Security** | Knows RLS value | Explains why no-CSP + the inline-script tension | Designs nonce-CSP without breaking the theme script |
| **Performance** | Knows SSG is fast | Diagnoses 58MB unoptimized images | Designs the markdown→next/image routing |
| **Maintainability** | Notices docs drift | Catalogs README/schema/script drift | Designs the docs-freshness CI process |

---

*End of interview document. 105 questions across 5 rounds. All file/function references verified against the bassaer codebase.*
