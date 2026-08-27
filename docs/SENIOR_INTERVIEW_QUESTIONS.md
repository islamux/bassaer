# Senior Engineering Interview: Basaar (بصائر)

> **Format:** 4 rounds × 25 questions = 100 + 5 bonus = 105 total
> **Target:** Mid→Senior candidate
> **Style:** FAANG/Big Tech — behavioral, architectural depth, system design, debugging, and coding
> **Project:** Arabic-RTL digital-book PWA transforming Dr. Haitham Talaat's apologetics work into a navigable web app — Next.js 16 / React 19, **fully static export (Serwist PWA) + localStorage bookmarks (CustomEvent sync) + flexsearch + react-markdown**, 13 chapters / 522 images

---

## Round 1: Architecture & System Design (25 questions)

### Q1. Why `@serwist/next` over `next-pwa` for the service worker?

**A:** `next-pwa` (Workbox-based) is **unmaintained** for modern Next.js; Serwist is its actively-maintained successor, supports the Next 16 App Router, and ships `@serwist/next` (the webpack/turbopack wrapper) + a `defaultCache` preset (`sw.ts:1,10`). Config in `next.config.ts:4-9` via `withSerwistInit({ swSrc:'sw.ts', swDest:'public/sw.js', reloadOnOnline:true, disable: NODE_ENV!=='production' })`. The choice is forced by Next 16 compat — `next-pwa` would break. Trade-off: Serwist is newer (less battle-tested than Workbox's long history) but actively maintained and App-Router-native.

### Q2. The SW source (`sw.ts`) is 13 lines, delegating to `defaultCache`. What's gained and lost?

**A:** `sw.ts:1-13` precaches `self.__SW_MANIFEST` (build manifest injected at compile), `skipWaiting:true`+`clientsClaim:true` (instant activation), `navigationPreload:true`, `runtimeCaching: defaultCache` (Serwist's curated Next.js preset: CacheFirst/SWR for assets, NetworkFirst for navigations). **Gained**: minimal config, sane defaults, no hand-rolled route matching. **Lost**: zero custom rules — the app **adds nothing** on top of the preset, so there's no explicit offline fallback page (`setCatchHandler`), no per-route strategy, no `/api/` handling. For a content site (mostly static assets + cached navigations), the preset suffices; for an app needing fine control, you'd add custom rules. The "trust the preset" decision is defensible and minimal.

### Q3. The app is a fully static export (`output: "export"`). What are the trade-offs vs SSR/SSG-with-server?

**A:** `next.config.ts:12` sets `output: "export"` (plus `trailingSlash: true` and `images.unoptimized: true`). Everything is prerendered to plain HTML at build (`out/`); there is **no server runtime** at all — no middleware, no route handlers, no server actions. **Gained**: deploy to any static host (Hostinger shared hosting), zero server cost, CDN-cacheable every byte, no env/DB at build. **Lost**: no request-time data, no server-side auth (which is why all personalization is client-side), no dynamic `headers()`, no image optimization (hence `images.unoptimized: true`). Every dynamic behavior (search, bookmarks, theme, reading progress) runs client-side against `localStorage` or a static JSON file. This is an ideal shape for a book-content site; it would be wrong for an app needing per-user server state.

### Q4. There's no backend at all. How do bookmarks stay in sync without one?

**A:** Bookmarks live entirely in `localStorage` under a single key (`lib/bookmarks.ts:1` `basaar-bookmarks`). `toggleBookmark`/`removeBookmark`/`isBookmarked` read/write that store (`lib/bookmarks.ts:9-45`). UI sync is a lightweight pub/sub: `BookmarkButton` toggles then `window.dispatchEvent(new Event('bookmarks-updated'))` (`components/BookmarkButton.tsx:40`); `BookmarkedChapters` re-fetches the list on both the `storage` event (cross-tab) and the `bookmarks-updated` event (same-tab) (`components/BookmarkedChapters.tsx:15-16`). So there's no global store — the button "shouts" and the sidebar list re-reads the source of truth. Because there's no account concept, bookmarks are per-device (localStorage is not synced across devices).

### Q5. The auth/server layer was removed (commit `5f0ced6`). Why, and what was deleted?

**A:** The app used to run a server-managed auth stack (magic-link email sign-in, a `/auth/callback` route handler, three auth clients, an `AuthProvider` context, backend-restricted bookmarks) on Vercel. That whole stack was removed in `5f0ced6` when the app moved to static export for Hostinger shared hosting. Deleted: the `lib/` auth clients/context, `app/auth/callback/route.ts`, `components/AuthButton.tsx`/`UserMenu.tsx`, `middleware.ts`/`proxy.ts`, and the auth dependency. Bookmarks became localStorage-only, and the static build no longer requires any `NEXT_PUBLIC_*` env vars. The **benefit**: the deployment model collapses to "upload static files"; **cost**: no cross-device sync, no per-user accounts. That is an acceptable trade for a content site where the book is the product, not user accounts.

### Q6. Bookmarks are localStorage-only. Why is that reasonable here, and what's the downside?

**A:** Reasonable because: (1) the site is a fully static export with no server runtime — a backend would reintroduce servers, breaking the Hostinger static-host model; (2) a bookmark is low-stakes, per-device state; (3) it's the simplest, dependency-free implementation (`lib/bookmarks.ts` is ~45 lines, no SDK). **Downside**: bookmarks don't follow the user across devices (localStorage is per-browser), they're lost if the user clears site data, and there's no account to attach them to. If cross-device sync ever mattered, you'd add a backend (or an external sync provider) and reintroduce accounts — a deliberate, currrently-unneeded lift.

### Q7. The search corpus `public/search-data.json` is generated by a `prebuild` script. Why regenerate at build rather than commit by hand?

**A:** `scripts/build-search-index.mjs` reads `content/chapters/*.md`, strips headings/blockquotes into plain text, and writes `public/search-data.json` (`package.json:8` wires it to `prebuild`, which runs before `next build`). Regenerating at build guarantees the search text **can't drift** from the chapter markdown: edit a chapter, rebuild, and search reflects it. A hand-committed file would silently diverge (the old failure mode this replaced). The file is still committed/tracked because the prebuild output is deterministic and serves as the shipped artifact; the script is the single source of truth. The FlexSearch **index** itself is built client-side at runtime from this JSON (`components/SearchDialog.tsx:44-73`), not at build.

### Q8. Search uses flexsearch client-side on a ~1.7 MB JSON. Why not a server search endpoint?

**A:** `public/search-data.json` (~1.7 MB) is fetched lazily by `components/SearchDialog.tsx:48` only when the dialog opens; flexsearch is dynamically imported (`:46`) (code-split); the index is built client-side (`:52-60`). No server search endpoint. Reasons: (1) the site is static export (no server exists to run an endpoint); (2) client search works offline (PWA); (3) no server cost. Trade-off: 1.7 MB first-search-fetch + client CPU to build the index. Mitigated by lazy load (only searchers pay) and the SW's runtime caching of the fetched file. `README.md:36` accurately describes this: corpus generated at build, index built client-side.

### Q9. `tokenize: 'forward'` in the flexsearch config. Why for Arabic?

**A:** `components/SearchDialog.tsx:58` — `FlexSearch.Document({ tokenize:'forward', ... })`. `forward` tokenization indexes all **prefixes** of each word (substring-friendly), so searching "كتاب" matches within "المكتبة". This suits Arabic, which uses prefixes/prefix-like attachers (الـ, وـ, بـ) that don't have spaces — a forward tokenizer catches matches inside compound forms. `strict` (whole-word) would miss prefixed forms; `full` (all substrings) is more thorough but heavier. `forward` is the pragmatic middle. `cache:true` (`:60`) memoizes queries.

### Q10. Chapter content is markdown rendered via react-markdown with **no `components` override**. What's the perf consequence?

**A:** `app/chapter/[slug]/page.tsx:61-63` — `<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>` with no `components` prop → default renderers → images render as **plain `<img>`**, not `next/image`. The 522 chapter images ship **unoptimized** (no responsive srcset, no WebP/AVIF, no sharp processing) — and with `images.unoptimized: true` even `next/image` wouldn't optimize. This is the single biggest perf liability: `sharp` is installed (`package.json:28`) but unused at runtime because the markdown bypasses `next/image` and static export disables optimization. Fix: add a `components={{ img: ({src, alt}) => <Image src={src} alt={alt} fill sizes="..."/> }}` override (subject to the static-export constraints) and pre-optimize the 522 sources at build (e.g. a compress-images script) to compensate for `unoptimized`.

### Q11. The content is extracted from a `.docx` via Python scripts. Why Python, and what's the drift?

**A:** `scripts/docx_to_md.py` (python-docx) maps Word paragraph ranges → 13 `.md` files; `scripts/inject_docx_images.py` extracts embedded images. Python is used because python-docx is mature for `.docx` (Node's `mammoth` is an alternative). **Drift**: `README.md:28-31` still says "PyMuPDF/fitz" and "ar-basaar.pdf" — the source moved from PDF to DOCX, scripts changed to python-docx, but the README wasn't updated. Also `scripts/inject_docx_images.py:10` writes `IMAGES_OUT_DIR = 'web/public/images'` (a non-existent `web/` monorepo path) — stale. And `scripts/word_diff.py`'s `CHAPTER_RANGES` **disagree** with `docx_to_md.py`'s `MAPPINGS` (e.g. chapter-1 and chapter-6 differ). Two scripts with inconsistent mappings.

### Q12. `--webpack` flag on dev/build. Why, given Next 16 defaults to Turbopack?

**A:** `package.json:6-7` `next dev --webpack` / `next build --webpack`. `lib/contentLoader.ts` uses Node `fs` at build time (reads markdown off disk); `docs/upgrade-nextjs.md:24` notes Turbopack's handling of `fs`/PostCSS needed verification, so webpack is the safe fallback. Trade-off: forgo Turbopack's speed gains for build safety. Once Turbopack's `fs` handling is confirmed stable for this use case, you could remove the flag. The flag is a deliberate "verified-working" choice, not negligence.

### Q13. The app is fully static (SSG). How does the client-side personalization (bookmarks, reading progress, theme) interact with that?

**A:** Chapters are static (`generateStaticParams` pre-renders all 13 slugs). All personalization is client-side only: `BookmarkButton`/`BookmarkedChapters` read/write `localStorage`, `ReadingProgressBar` stores scroll position in `localStorage` (`lib/readingProgress.ts`), and the theme is a client toggle persisted to `localStorage('theme')`. So the static HTML ships fast (CDN-cached, no DB hit), and the dynamic state hydrates/initializes client-side after paint. This is the "static content + client-side personalization" pattern — ideal for a content site with light, per-device features and no server runtime. There is no server execution at all (no route handlers, no server actions).

### Q14. `BookmarkedChapters` syncs via a custom event (`bookmarks-updated`), not a global store. Explain.

**A:** `components/BookmarkButton.tsx:40` dispatches `window.dispatchEvent(new Event('bookmarks-updated'))` on toggle; `components/BookmarkedChapters.tsx:15-16` listens to both `storage` (cross-tab) and `bookmarks-updated` (same-tab) events → re-fetches the list. This is a **lightweight pub/sub** without Redux/Zustand — the bookmark button doesn't know who renders the list; it just shouts. Trade-off: simple, no store boilerplate, but it's stringly-typed (`'bookmarks-updated'`) and global (any listener can intercept). At this scale (one producer, one consumer), it's pragmatic. A store would be cleaner if many components needed bookmark state.

### Q15. `getBookmarks` is `async` even though it only touches `localStorage`. Why, and is that a smell?

**A:** `lib/bookmarks.ts:24-45` exports `async` wrappers (`getBookmarks`, `toggleBookmark`, `removeBookmark`, `isBookmarked`) over synchronous `localStorage` operations — the async signature forces `.then`/`await` in callers. **Smell**: it's a leftover from when these functions awaited a backend; after the auth removal, sync would be cleaner and better match the sibling `lib/readingProgress.ts` (which is sync, `lib/readingProgress.ts:9-37`). The inconsistency is a minor code-quality debt: either make bookmarks sync (mirroring readingProgress) or keep the async deliberately for a future backend swap. Note `readStorage`/`writeStorage` correctly guard `typeof window === "undefined"` for the SSR/static-build path (`lib/bookmarks.ts:10,20`).

### Q16. `localStorage` reads happen inside functions with a `typeof window` guard. Why does that matter on a static site?

**A:** During `next build` (static export), server-side module evaluation runs in Node where `window`/`localStorage` don't exist. Without the guard, importing or calling these at build/prerender time would throw `ReferenceError`. `readStorage`/`writeStorage` guard with `if (typeof window === "undefined") return` (`lib/bookmarks.ts:10,20`), and `getLocalProgress` likewise (`lib/readingProgress.ts:10`). This is the same class of guard needed for any client-only API on a prerendered site: the component/hook must not touch browser globals during the server render pass. `useSyncExternalStore` with a server snapshot (`() => 0`) is the standard pattern for the progress bar (`components/ReadingProgressBar.tsx:19-23`).

### Q17. `reloadOnOnline: true` in the Serwist config. What's the UX?

**A:** `next.config.ts:7` — when connectivity returns (browser fires `online`), Serwist reloads the page so the user gets fresh content. Aggressive freshness at the cost of **discarding in-memory UI state** (scroll position, open dialogs, form input). For a reading app, a mid-read reload on reconnect is jarring. Trade-off: guaranteed-fresh content vs UX continuity. An alternative: SWR (stale-while-revalidate) silently updating without a full reload. The choice depends on how stale-tolerant the content is; for a book that rarely changes, `reloadOnOnline` may be over-aggressive.

### Q18. `skipWaiting` + `clientsClaim` are both true. What does that imply for deploys?

**A:** `sw.ts:7-8` — a new SW activates **immediately** on the next navigation (doesn't wait for all tabs to close). Implication: when you deploy, users get the new version ASAP — good for freshness/bugfixes. Risk: **version skew mid-session** — a user mid-chapter could get new HTML/JS swapped in, potentially breaking in-flight state if the data shape changed. For a content site with stable data, low risk; for an app with breaking migrations, you'd use `prompt` (ask the user) instead. The choice favors freshness; acceptable here.

### Q19. There's no CSP header. Why, and what would you do?

**A:** `next.config.ts` (the whole file, `:1-17`) has **no `headers()` block** — not even `X-Frame-Options`/`X-Content-Type-Options`. The reasons historically cited for omitting CSP still apply: the inline anti-FOUC theme script (`app/layout.tsx:39-41`) would need `'unsafe-inline'`, defeating CSP's value. Also relevant: with `output: "export"` there are **no server-side headers at all** — security headers on a static host are configured at the host/CDN layer, not in `next.config.ts`. To harden: configure headers (CSP with a hash of the inline script, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, etc.) on the Hostinger/CDN config, or extract the theme script so it can be served with a nonce. Currently the only CSP-relevant hardening is that react-markdown disables raw HTML by default (Q57).

### Q20. Does the home page import `next/image`? Is there dead code from the auth removal?

**A:** `app/page.tsx` imports only `Link` and `getAllChapters` (`app/page.tsx:1-2`) — the old dead `next/image` import is gone, and the hero uses a CSS radial gradient (`:15`), not an image. The auth removal did leave one dead artifact: `scripts/inject_docx_images.py:10` still points at the defunct `web/public/images` path (Q11/Q85), and in `package.json` the `start` script (`package.json:9`, `next start`) is unusable under `output: "export"` (`next start` throws with export; you'd `serve out/` instead). A senior reviewer flags these as remnants of an abandoned deploy model.

### Q21. How does the reading-progress bar find the scrollable parent?

**A:** `components/ReadingProgressBar.tsx:30-64` — **walks up the DOM** from the progress element to find the nearest scrollable ancestor (checking `overflowY` computed style, `:34-40`), then attaches the scroll listener there (not `window`). This matters because the chapter content scrolls within a container, not the window. `requestAnimationFrame`-throttled (`:48-60`) with `{ passive: true }` listener (`:62`). Stores/restores progress via `localStorage` (`basaar-reading-progress`, `lib/readingProgress.ts:27-37`) through `useSyncExternalStore` to survive hydration (`:19-28`). `role="progressbar"` + `aria-valuenow/min/max` for a11y. This is sophisticated, correct scroll handling.

### Q22. `readingProgress.ts` and `bookmarks.ts` each use one localStorage key. Why is a single key per feature enough?

**A:** `lib/readingProgress.ts:1` stores all chapter progress under one `basaar-reading-progress` key (an array of `{chapterId, scrollPercentage, updatedAt}`); `lib/bookmarks.ts:1` stores bookmarks under `basaar-bookmarks` (an array of `{chapterId, chapterTitle, timestamp}`). A single key per feature is sufficient because the whole array is cheap to read/write atomically and small (≤13 chapters). This is simpler than the previous three-key (source/cache/pending) design that existed to support offline write-behind to a backend — now removed. One key, one array, read-modify-write in place. The tile/section pattern (a key for each chapter) would only matter if arrays grew large; here it would be premature.

### Q23. `chapter/[slug]/page.tsx` strips the leading `# H1` before rendering. Why?

**A:** `app/chapter/[slug]/page.tsx:62` — `content.replace(/^#\s+.*$/m, '').trim()` removes the first H1 (the chapter title) because the page already renders the title as `<h1>` above (`:55`). Without stripping, you'd get **duplicate H1s** (the page's + the markdown's) — bad for SEO and heading hierarchy. The regex removes only the first H1. Edge case: if a chapter's markdown has no leading H1 or a different structure, the regex is a no-op (safe). This is a clean dedup.

### Q24. The sitemap has priority tiers (`intro` 0.9). Why differentiate?

**A:** `app/sitemap.ts:13` — `intro` gets `priority: 0.9`, others `0.8`; the home page gets `1.0` (`:19`). `priority` hints to crawlers which pages matter most (the introduction is the entry point). It's a weak signal (Google mostly ignores `priority`), but harmless and documents intent. The sitemap is `force-static` (`:4`), lists all chapters × the base URL (`:6`, env-driven `NEXT_PUBLIC_BASE_URL`, defaulting to a stale Vercel domain), and for a 13-chapter book is small and complete. A senior note: `priority` is largely symbolic; `lastmod` (actual content change dates) is more impactful for crawl frequency.

### Q25. If you were rebuilding from scratch, top three changes?

**A:** (1) **Pre-optimize the 522 chapter images at build** (Q10/Q78) — since `images.unoptimized: true`, add a build script (sharp) producing responsive/AVIF variants of `public/images/**`; watch + serve those from markdown. This is the biggest perf win. (2) **Reconcile the Python extraction scripts** (Q11) — fix `web/public/images` path in `scripts/inject_docx_images.py:10`, align `word_diff.py` ranges with `docx_to_md.py`, or replace with one script. (3) **Make bookmarks sync** to match `readingProgress.ts` (Q15) and prune the dead `start` script (`package.json:9`). Beyond: fix the README PDF→DOCX drift (Q11/Q105) and add the `offlineFallback` to the SW (Q2). The architecture is sound (Serwist + static export + flexsearch + localStorage is a strong, serverless stack); the gaps are execution details, not design.

---

## Round 2: React & Next.js Deep Dive (25 questions)

### Q26. `ClientShell` is a client wrapper around `{children}`. Why this pattern for the root layout?

**A:** `components/ClientShell.tsx:15-40` (`'use client'`) wraps `{children}` in Navbar/SearchDialog/InstallPrompt/Footer. The root layout (`app/layout.tsx:29`) is a **server component** (for fonts, metadata, RTL, the inline theme script) — it can't host client interactive components directly. So it renders `<ClientShell chapters={chapters}>{children}</ClientShell>` (`app/layout.tsx:44`), moving the client boundary one level down. This is the standard "server root layout + client provider shell" pattern: keep the document shell server-rendered (metadata, fonts), wrap the app in a client island for interactivity. The `Ctrl/Cmd+K` search listener (`components/ClientShell.tsx:18-27`) lives here in a `useEffect` with cleanup.

### Q27. `Ctrl/Cmd+K` opens the search. How is it wired, and what's the a11y concern?

**A:** `components/ClientShell.tsx:18-27` — a `useEffect` adding a `keydown` listener: if `(e.ctrlKey || e.metaKey) && e.key === 'k'`, `e.preventDefault()` + toggle search. Concern: `Ctrl+K` is a common browser/OS shortcut (focus address bar in some browsers); `preventDefault` overrides it. Also, the listener should ignore when the user is typing in a field (to not hijack). The `SearchDialog` handles Esc/arrow/Enter (`:115-135`) and has `role="dialog" aria-modal` (`:146-148`). The global shortcut is a power-user feature; ensure it doesn't break browser defaults unexpectedly.

### Q28. `SearchDialog` lazy-imports flexsearch and fetches the JSON once on mount. Why?

**A:** `components/SearchDialog.tsx:44-73` — the init effect runs once on mount and does `await import('flexsearch')` (code-split the lib out of the main bundle, `:46`) + `fetch('/search-data.json')` (~1.7 MB, `:48`) + index construction (`:52-60`). Because the dialog component is only mounted when rendered (it returns `null` when closed, `:137`), heavy resources are pulled only when the search UI is first needed, not at page load. So users who never open search pay zero cost for flexsearch and the JSON. The index is cached in a ref (`indexRef`) so reopening the dialog reuses it. This is lazy-loading done right: defer heavy, optional features until needed.

### Q29. Search results dedupe by id across the `title` and `content` fields. Why?

**A:** `components/SearchDialog.tsx:82-103` — flexsearch searches both `title` and `content` indexes (`:55`); a chapter matching both would appear twice. The dedupe (`seen` Set keyed by `docId`, `:87-95`) collapses to one result with the higher score. This is necessary because multi-field search returns per-field matches. The dedupe key is the chapter id (stable). Without it, the user sees duplicate entries for the same chapter. `enrich:true` (`:84`) returns the stored doc, so the deduped result keeps full context (title/content/slug).

### Q30. `BookmarkButton` toggles synchronously. What happens on toggle and how does the UI update?

**A:** `components/BookmarkButton.tsx:35-41` — `handleToggle` awaits `toggleBookmark(chapterId, chapterTitle)` (a `localStorage` read-modify-write in `lib/bookmarks.ts:28-35`), computes the new `active` state from the returned list, then dispatches `bookmarks-updated`. The button's `active`/`loading` state (`:13-14`) drives the visual/aria-label. Because the write is local and synchronous, there's no failure/rollback path (Q15) — the "optimistic update" concern that existed with a remote backend is moot. `isBookmarked` is read in a `useEffect` with a `cancelled` guard for async unmount safety (`:23-33`).

### Q31. `Navbar` reads the dark-mode class via `useSyncExternalStore`, not `useState` during render. Why?

**A:** `components/Navbar.tsx:14-31` — `useSyncExternalStore(subscribeTheme, () => document.documentElement.classList.contains('dark'), () => false)` subscribes to a custom `basaar-theme-change` event (`:14-17`). The server snapshot `() => false` matches the server-rendered default so there's **no hydration mismatch** (the server has no `.dark` class). `toggleTheme` (`:27-31`) flips the class, persists to `localStorage('theme')`, and dispatches the event so the external store re-syncs. Paired with `<html suppressHydrationWarning>` + the inline theme script (`app/layout.tsx:39-41`). This is the no-FOUC pattern made hydration-safe; `useSyncExternalStore` is preferable to a post-effect `useState` because it re-renders on external events without extra effects.

### Q32. `MobileMenu` uses `translate-x-full` for hidden state. Why that over `display:none`?

**A:** `components/MobileMenu.tsx:26-30` — `translate-x-full` (RTL: off-screen to the right) enables CSS **transitions** (slide in/out), vs `display:none` (instant, no animation). For a drawer, the slide is the UX. The direction in RTL needs care (off-screen side differs LTR vs RTL) — under `dir="rtl"`, `translate-x-full` shifts it off the right edge correctly. `role="dialog" aria-modal` (`:31-33`) for a11y. A caveat: the hidden drawer stays in the DOM and tabbable when closed (`:28-34`) — an `aria-hidden`/`inert` guard when closed would improve accessibility. This is standard mobile-drawer pattern.

### Q33. `Sidebar` is a **server component** that calls `getAllChapters()`. How does it embed a client `BookmarkedChapters`?

**A:** `components/Sidebar.tsx:5-6` — no `'use client'`; calls `getAllChapters()` server-side (fs read at build). It renders `<BookmarkedChapters>` (client, `:14`) as a child. A server component **can render client components** — the client boundary is per-component, not global. So the static chapter list is server-rendered (SEO, no JS), and the interactive bookmarks section is a client island within it. This is the App Router's strength: mix server (static data) and client (interactivity) in the same tree. The same pattern appears in `components/MobileMenu.tsx:47`.

### Q34. `Sidebar` and `MobileMenu` both embed `BookmarkedChapters`. What happens when the user toggles a bookmark from the chapter page?

**A:** `BookmarkButton` dispatches `bookmarks-updated` (`components/BookmarkButton.tsx:40`). Every mounted `BookmarkedChapters` instance — the one in the desktop `Sidebar` (`components/Sidebar.tsx:14`) and the one in the mobile `MobileMenu` (`components/MobileMenu.tsx:47`) — has subscribed to that event (`components/BookmarkedChapters.tsx:16`) and re-fetches the list. Because there are two possible consumers (desktop sidebar + mobile drawer), the event-bus design (Q14) is what lets both update without either knowing about the other. The `storage` listener (`:15`) additionally catches cross-tab changes (two tabs reading the same book). This is the "one producer, N consumers" case where a global event is genuinely simpler than threaded props.

### Q35. `BookmarkedChapters` returns `null` when there are no bookmarks. Why?

**A:** `components/BookmarkedChapters.tsx:30` — renders `null` (nothing) when there are no bookmarks, rather than an empty section. Reason: an empty "Bookmarks" sidebar section adds visual noise. Returning null removes it entirely until the user has bookmarks. Trade-off: the user doesn't know the feature exists until they bookmark something (discoverability). An alternative: show a muted "No bookmarks yet" hint. The null-return is a minimalist choice, and it also means the desktop sidebar (Q33) shows only the TOC until the user bookmarks a chapter.

### Q36. `InstallPrompt` detects iOS standalone. Why the special case?

**A:** `components/InstallPrompt.tsx:14-18` — an initializer checks `window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true` to know if the app is already running installed (especially iOS Safari, which has no `beforeinstallprompt` event and installs via "Add to Home Screen"). The `BeforeInstallPromptEvent` typing (`:6-9`) handles Chromium's install API; `handleBeforeInstall`/`handleInstalled` (`:20-41`) drive the prompt UI; `handleInstall` (`:43-52`) calls `deferredPrompt.prompt()`. So the component shows an install button on Chromium, hides when already installed, and never shows on iOS standalone (where install is manual). This is cross-browser PWA install handling — iOS is the special snowflake.

### Q37. `ErrorBoundary` wraps the chapter article. Why there specifically?

**A:** `app/chapter/[slug]/page.tsx:53,81` — `<ErrorBoundary>` wraps the `<article>` (the markdown content + prev/next nav). If react-markdown throws (malformed markdown, a remark plugin error), the boundary catches and shows a fallback (a localized "حدث خطأ" with retry, `components/ErrorBoundary.tsx:27-41`) — but the rest of the page (nav, header, chapter title, reading-progress bar at `:52`) stays usable. Placing the boundary around just the risky content (the rendered markdown) is precise — a whole-page boundary would hide the nav on a content error. This is thoughtful boundary placement.

### Q38. `generateStaticParams` for chapters + `generateMetadata`. How do they compose?

**A:** `app/chapter/[slug]/page.tsx:11-16` `generateStaticParams` returns the chapter slugs (from `getAllChapters`) → Next pre-renders `/chapter/intro`, `/chapter/chapter-1`, etc. `generateMetadata` (`:18-31`) is async, `await params`, returns per-chapter title/description for SEO. So each static chapter page gets its own `<title>`/`<description>`. This is correct SSG + per-page metadata — the content-site ideal. `notFound()` (`:38`) is called for unknown slugs, which feeds the custom `app/not-found.tsx` (Q48).

### Q39. `app/layout.tsx` inlines the anti-FOUC theme script. Why inline (not a file)?

**A:** `app/layout.tsx:39-41` — an inline `<script>` reads `localStorage('theme')` + `prefers-color-scheme` and adds the `.dark` class before paint. Inline (not external) because it must run **synchronously before first paint** to prevent FOUC; an external file would be a separate request with potential delay. The trade-off (Q19): inline scripts require `'unsafe-inline'` in CSP (or a nonce/hash), which is part of why there's no CSP. The pattern is correct for FOUC prevention; the CSP tension is the cost.

### Q40. `app/page.tsx` (home) is a server component reading chapters at build. What's the rendering model?

**A:** `app/page.tsx:5-6` — server component, `getAllChapters()` (fs read at build) → renders hero + chapter grid. Since it's static (no dynamic data), Next pre-renders it as static HTML. The hero uses a CSS radial gradient (`:15`, no image), and the grid maps chapters to cards (`:34-47`). Fully static, CDN-cached, zero runtime cost. This is the content-site ideal. The first-card link `href` falls back to `intro` if the list is empty (`:24`).

### Q41. `ChapterPage` computes prev/next by array index. What's the edge case?

**A:** `app/chapter/[slug]/page.tsx:41-45` — prev/next by index in the `chapters` array. Edge cases: first chapter (no prev → null/hide), last chapter (no next). The `getAllChapters` sort (intro-first, then numeric, `lib/contentLoader.ts:49-61`) determines the order — if the sort changes, prev/next change. A `notFound()` (`:38`) handles unknown slugs. The index-based approach assumes a linear reading order (a book) — correct for this app. A non-linear structure (e.g., themed collections) would need a different nav model.

### Q42. `SearchDialog` has keyboard nav (↑↓ Enter Esc). How is focus managed?

**A:** `components/SearchDialog.tsx:115-135` — arrow keys move the `selectedIndex`, Enter navigates via `router.push` to the selected chapter (`:130-133`), Esc closes. The input is focused on open (`:40-42`); on close the dialog unmounts (returns `null`, `:137`) and focus returns to the trigger naturally. `role="dialog" aria-modal` (`:146-148`). This is solid keyboard UX; a known minor gap (per audit) is a full focus trap (Tab can leave the modal) and the input lacking an explicit `aria-label` (placeholder-only, `:158`).

### Q43. `Footer` is a server component with an external link. Why the `rel` attributes?

**A:** `components/Footer.tsx:4-8` — the "Who Wants to Be a Millionaire" companion link uses `target="_blank" rel="noopener noreferrer"`. `noopener` prevents the new tab from accessing `window.opener` (reverse tabnabbing); `noreferrer` prevents sending the referrer. Both are correct for external links. Being a server component is fine (no interactivity). The companion link is another project by the same author.

### Q44. `reactStrictMode` — is it on, and what would it surface?

**A:** `next.config.ts` (`:1-17`) does **not** set `reactStrictMode` explicitly — StrictMode is **on by default** in Next.js 16's App Router. In dev, StrictMode double-invokes effects, surfacing: `ClientShell`'s keydown listener cleanup (`components/ClientShell.tsx:26`), `BookmarkButton`'s `cancelled`-guarded effect (`components/BookmarkButton.tsx:30-33`), `BookmarkedChapters`' event-listener cleanup (`components/BookmarkedChapters.tsx:17-21`), `ReadingProgressBar`'s scroll listener + rAF cleanup (`components/ReadingProgressBar.tsx:63`), and `InstallPrompt`'s event cleanup (`components/InstallPrompt.tsx:37-40`). A missing cleanup → double-subscription/double-listener in dev (visible bug). The `cancelled`/cleanup patterns throughout confirm these are handled.

### Q45. The `SearchIndex` type is cast (`as unknown as SearchIndex`). Why the workaround?

**A:** `components/SearchDialog.tsx:60` — flexsearch's TypeScript types are loose/complex (the library's types don't fully capture the runtime shape). The `as unknown as SearchIndex` double-cast bypasses TS to assign the constructed index to a locally-declared interface (`:10-13`). Flagged as a type-safety item (a targeted workaround rather than `any`). Risk: TS can't catch misuse of the index API. Mitigation: wrap flexsearch in a typed adapter module exposing a clean interface; or contribute better types to flexsearch. The cast is a known escape hatch for a loosely-typed lib.

### Q46. `extractExcerpt` windows around the match. How wide, and why?

**A:** `lib/search.ts:15-30` — builds a snippet around the match position (60 chars before, 120 after, `:24-25`), falling back to the first 150 chars if the query isn't found (`:20-22`). The window shows enough surrounding text for the user to judge relevance without showing the whole chapter. Too narrow → not enough context; too wide → bloated results. The excerpt is plain text (markdown/HTML stripped in the prebuild) for the result list. A senior note: highlight the match term within the excerpt (`<mark>`) for scannability (Q81), and normalize case (Arabic is mostly moot, but Latin terms would be case-sensitive via `indexOf`, `:19`).

### Q47. `app/not-found.tsx` is a custom Arabic 404. Why a server component?

**A:** `app/not-found.tsx:3-21` — server component, custom Arabic "page not found" with a return-home link. Server is fine (no interactivity). Being static, it's small and in the precache. A 404 should be fast (user hit a dead link) and localized (Arabic audience). The custom 404 is better UX than Next's default. For SEO, a 404 should return HTTP 404 (Next does for `not-found.tsx`). It's reachable for unknown chapters via `notFound()` in `ChapterPage` (`app/chapter/[slug]/page.tsx:38`).

### Q48. `app/sitemap.ts` is `force-static`. Why, and how does it differ from the custom 404?

**A:** `app/sitemap.ts:4` `export const dynamic = "force-static"` — the sitemap is a metadata route that doesn't vary per request, so force-static generates it once at build (not per-request). For a 13-chapter book it's small and stable. This is correct Next 16 metadata-route practice. Contrast with `app/not-found.tsx`: the 404 is a normal page rendered on demand for unknown routes, while the sitemap is a build-time static artifact. Both are server components producing static output under `output: "export"`. There is no separate robots route — robots is `public/robots.txt`.

### Q49. Is there any dead-code or server-artifact risk with `output: "export"`?

**A:** Under `output: "export"`, Next refuses to emit route handlers/server actions (they don't exist here — the tree has none). The main observable dead-code/artifact items: (1) `package.json:9` `start: "next start"` is broken under export (throws; use `serve out/`), (2) `scripts/inject_docx_images.py:10` points at the defunct `web/public/images`, (3) README extraction drift (`README.md:28-31`, Q11), and (4) `app/sitemap.ts:6` defaults to a stale Vercel domain. None affect the shipped static build (the build prunes unused routes), but they're README/scripts hygiene gaps a reviewer flags.

### Q50. `public/sw.js` is gitignored but `public/search-data.json` is tracked. Why the difference?

**A:** `.gitignore` has `/public/sw.js` — the service worker is **build-generated**: Serwist regenerates it on every production build, embedding per-build hashed `/_next/static/...` URLs in the precache manifest. Committing it would (a) dirty the tree on every build and (b) risk a committed copy referencing asset hashes that don't exist in a checkout unless the deploy re-runs `pnpm build`. So it's generated at deploy time. `public/search-data.json`, by contrast, is **deterministic** (from the committed markdown) and tracks the content, so it's committed — and it's also regenerated by prebuild each build. Rule of thumb: commit deterministic, content-derived artifacts; ignore per-build, hash-embedded ones.

---

## Round 3: TypeScript, Data, & Build Pipeline (25 questions)

### Q51. `tsconfig` strictness — what's notable, and what's missing?

**A:** `tsconfig.json` sets `"strict": true` (`tsconfig.json:11`) plus `types: ["vitest/globals"]` (`tsconfig.json:20`), `target: ES2022` (`tsconfig.json:3`), and a `@/*` → `./*` path alias (`tsconfig.json:26-29`). The notable gap: flexsearch's loose types force the `as unknown as` cast (Q45), undermining type safety at a key boundary. The data layer (chapters from markdown) is stringly-typed (`Chapter.content` is a raw string, `lib/contentLoader.ts:15`). A Zod schema on chapter front-matter and a typed `search-data.json` (from `scripts/build-search-index.mjs`) would harden both boundaries. There is no generated-types layer to prune (the auth-generated types were removed with the auth layer). No implicit `any` was found under strict.

### Q52. `BookmarkedChapters` returns `null` when empty. Why?

**A:** `components/BookmarkedChapters.tsx:30` — renders `null` (nothing) when there are no bookmarks, rather than an empty section. Reason: an empty "Bookmarks" sidebar section adds visual noise. Returning null removes it entirely until the user has bookmarks. Trade-off: the user doesn't know the feature exists until they bookmark something (discoverability). An alternative: show a muted "No bookmarks yet" hint. The null-return is a minimalist choice.

### Q53. The `.md` content files are the source of truth for both rendering and search. How is that enforced?

**A:** Both `lib/contentLoader.ts` (`getAllChapters`/`getChapterData`, reading `content/chapters/*.md`) and `scripts/build-search-index.mjs` read the same committed markdown. Rendering reads it directly at build (`next build`); search reads the prebuild-generated `public/search-data.json` which is derived from the same files. The single-source-of-truth is enforced by the `prebuild` script (`package.json:8`) regenerating the corpus from markdown before every build — so a chapter edit propagates to both rendering and search with no manual step. The control-tower check is `pnpm build`: if a script path or file were wrong, `prebuild` fails the build.

### Q54. `getBookmarks`/`toggleBookmark` are `async` over synchronous `localStorage`. Trace the consistency guarantees.

**A:** `lib/bookmarks.ts` uses one `basaar-bookmarks` key holding the whole array (`:1`). `toggleBookmark` (`:28-35`) reads the current array, computes the next (remove if present, else prepend with `Date.now()`), and writes atomically; `removeBookmark` (`:37-41`) filters and writes; `isBookmarked` (`:43-45`) scans. Because reads/writes are atomic on one key, there's no partial-consistency window (the old three-key source/cache/pending design is gone). The only coordination concern is cross-context: the event dispatch (`components/BookmarkButton.tsx:40`) and the `storage`/`bookmarks-updated` listeners (`components/BookmarkedChapters.tsx:15-16`) ensure every UI instance re-reads the single source after a mutation. The `async` signature is a leftover that should be sync (Q15).

### Q55. `getAllChapters` sorts intro-first then numeric. Decode the sort.

**A:** `lib/contentLoader.ts:49-61` — sorts `intro` first (the book's introduction), then `chapter-1`, `chapter-2`, ... numerically (not lexically — `chapter-10` must come after `chapter-2`, not `chapter-1` lexically). The sort extracts the numeric suffix (`parseInt(a.id.replace('chapter-',''))`, `:54-55`) and compares as numbers. This is the classic "natural sort" for numbered files. Without numeric sort, `chapter-10` would sort before `chapter-2` (lexical) — wrong order. The intro-first special case (`:50-51`) reflects the book's structure.

### Q56. `getChapterData(id)` returns raw content (no parsing). Why there, not in the component?

**A:** `lib/contentLoader.ts:64-78` — `readFileSync` of the `.md`, returns the raw string. The `replace(/^#\s+.*$/m,'')` H1-strip and react-markdown rendering happen in the **page component** (`app/chapter/[slug]/page.tsx:61-63`), not the loader. Separation: the loader is data access (fs); the component is rendering (markdown → React). This keeps the loader simple/testable (returns a plain object) and the rendering concerns in the component. An alternative: parse in the loader (return structured data) — but react-markdown wants a string, so returning raw is fine.

### Q57. The markdown has no `rehype-sanitize`. Is that safe?

**A:** react-markdown v9 **drops raw HTML by default** (no `rehype-raw`), so `<script>` in the markdown is escaped, not rendered — safe. `rehype-sanitize` would add belt-and-suspenders, but for trusted first-party markdown (authored content, not user-generated), it's unnecessary. The XSS surface is low. The risk would rise if `rehype-raw` were added (then raw HTML renders → sanitize needed). Currently safe by react-markdown's default. The images-as-`<img>` (Q10) is a perf issue, not XSS.

### Q58. `search-data.json` has no content-hash in its filename. Why is that acceptable, and when would it bite?

**A:** Under `output: "export"` there's no server `Cache-Control` header to set (host-level only), and `public/search-data.json` is fetched by the client at `/search-data.json` (`components/SearchDialog.tsx:48`) — a fixed, non-hashed URL. In the old SSR config an immutable 1-year header was referenced; under static export that header isn't produced by Next at all. Because the file is regenerated by prebuild and served from a static host, a stale browser cache after a content update **is** a real risk: the URL doesn't change, so the browser may reuse a cached copy. Mitigation on a static host: short cache TTL for `.json`, or hash the filename and reference it from a manifest. For a book that changes rarely, the default (no immutable header) is acceptable; the moment content edits are frequent, you'd add cache-busting (Q103).

### Q59. Security headers on a static export — where do they actually get configured?

**A:** `next.config.ts` has **no `headers()` function** (the whole file is `:1-17`), and under `output: "export"` Next doesn't emit response headers anyway (headers are a server feature). So security headers must be configured at the hosting/CDN layer (Hostinger / any fronting proxy). Recommend: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Content-Security-Policy` appropriate to a static app (hash/`'self'` for the inline theme script, `:39-41`), and HSTS on HTTPS. A senior candidate should recognize that "where headers live" changes fundamentally when you drop a Node server for a static host — the old `next.config headers()` approach no longer applies.

### Q60. `pnpm-workspace.yaml` allow-lists `sharp`. Why?

**A:** `pnpm-workspace.yaml` has `allowBuilds: { sharp: true, unrs-resolver: true }` — pnpm v9+ blocks native postinstall/build scripts by default; the allow-list permits sharp's native (libvips) build. Without it, sharp installs but libvips is missing → image optimization breaks. The allow-list is required for sharp to function. Note: sharp is currently a build-time dep (`package.json:28`) that's **under-used** under static export because images are unoptimized (Q10) — it's installed-but-idle until images route through it (a pre-optimization build script would finally use it).

### Q61. How would you add cross-device bookmark sync back, given the current static architecture?

**A:** The current bookmarks are localStorage-only (`lib/bookmarks.ts`) with no account layer, by design (static export, no server). To add cross-device sync you'd reintroduce a backend or adopt a serverless sync provider: (1) add accounts (or sign-in via an external provider), (2) move the `Bookmark[]` shape to a table keyed by `(user_id, chapter_id)` with unique constraint for idempotent writes, (3) on sign-in merge local bookmarks into the account and clear the local store, (4) sync optimistic-writes with an offline write-behind queue keyed by the same unique constraint. This is exactly the system removed in `5f0ced6` — it was dropped to simplify hosting, not because it was wrong. The localStorage layer (`lib/bookmarks.ts`, the `bookmarks-updated` event) is the correct client abstraction to build sync on top of later: only `getBookmarks`/`toggleBookmark`/`removeBookmark` need to change.

### Q62. `vitest.setup.ts` is a single `import '@testing-library/jest-dom/vitest'`. What does that enable?

**A:** `vitest.setup.ts:1` — jest-dom's custom matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.) for Vitest, wired via `setupFiles` in `vitest.config.ts`. Without it, `expect(el).toBeInTheDocument()` is undefined. jsdom environment (`vitest.config.ts`, `environment: "jsdom"`) provides the DOM for component/lib tests. This is the minimal RTL+Vitest setup. A senior note: more setup (mocking `next/navigation`, `localStorage`, etc.) could live here, but the current minimal setup means tests mock per-file.

### Q63. The `bookmarks.test.ts` mocks only `localStorage`. What does that reflect about the current architecture?

**A:** `lib/__tests__/bookmarks.test.ts` defines `localStorage` on `globalThis` (mock `getItem`/`setItem` backed by an in-memory object, `:3-10`) and tests the pure CRUD paths (`toggle` adds/removes, `isBookmarked`, `removeBookmark`). There is **no backend/fetch mock** because there's no backend — the module is entirely localStorage-based. So the tests fully exercise the shipped behavior (unlike the old design where the server branches were mocked away). The gap now: there are no component-level tests for the `bookmarks-updated` event wiring (`BookmarkButton` → `BookmarkedChapters`), which the e2e spec covers only lightly.

### Q64. The `contentLoader.test.ts` mocks `fs` and `path`. What's the subtle issue?

**A:** `lib/__tests__/contentLoader.test.ts` mocks `fs` and `path` (both default/named exports consistently) so tests run in jsdom without real disk access. But the test's mocked `path.resolve` may differ from the real `process.cwd()`-based path used at runtime (`lib/contentLoader.ts:4`). So the tests verify "given this mocked fs + path, the logic works" but not "the real path resolves correctly." Integration risk: if the real path is wrong (wrong cwd), tests don't catch it. A real-fs integration test (with a fixtures dir, or reading the real `content/chapters`) would cover this. Mock-heavy unit tests can mask integration issues.

### Q65. The `search.test.ts` tests only `extractExcerpt`, not flexsearch. Why?

**A:** `lib/__tests__/search.test.ts` — `extractExcerpt` is a pure function (easy to unit test). flexsearch's index/search is hard to unit test (needs the full ~1.7 MB index, or a representative fixture). So the search *behavior* (flexsearch matches a query and the dialog renders results) is covered by e2e (`e2e/search.spec.ts`), not unit. This is a reasonable split: pure logic unit-tested, integration behavior e2e-tested. The gap: no unit test for the index *construction* logic or the dedupe in `SearchDialog` (`components/SearchDialog.tsx:52-60`, `:87-103`). A fixture-based unit test would help.

### Q66. Playwright e2e asserts SW registration + manifest. What does that verify?

**A:** `e2e/pwa.spec.ts` — asserts the manifest returns 200 and a service worker is registered. This verifies the PWA is wired (manifest reachable, SW installed) — a baseline PWA-health smoke test. It does **not** test offline behavior (the audit notes a missing offline e2e) — e.g., going offline and reloading to confirm cached content serves. A stronger test asserts `navigator.serviceWorker.getRegistration()` (feature detection `"serviceWorker" in navigator` passes even if registration fails) and adds `context.setOffline(true)` + reload + assert content. A gap worth filling for a PWA.

### Q67. `playwright.config.ts` runs `pnpm build && pnpm start` as the webServer. Why build (not dev)?

**A:** `playwright.config.ts` `webServer.command = "pnpm build && pnpm start"` — e2e runs against the **production build**, not dev mode. Reason: e2e should test what users experience (production build), and SW/PWA behave differently in dev (Serwist `disable: NODE_ENV!=='production'`, `next.config.ts:8` — SW only in prod). So testing PWA in dev would be meaningless (no SW). Building also catches build-time errors. Trade-off: slower test setup (full build). `reuseExistingServer: !CI` avoids rebuilding locally if a server's running. Note the `next start` under static export is itself a known friction point (Q49) — `serve out/` is the recommended replacement.

### Q68. CI uses 1 worker + 2 retries for Playwright. Why those settings?

**A:** `playwright.config.ts` — CI: `workers: CI ? 1 : undefined` (serial — CI machines may be resource-constrained and flaky parallel), `retries: CI ? 2 : 0` (flaky tests retry; CI environments are slower/less stable). `trace: "on-first-retry"` captures a trace for debugging a retried failure. Locally: fully parallel (fast). These are sensible CI-vs-local trade-offs. A senior note: 1 worker is slow for many tests; if the suite grows, consider sharding.

### Q69. The build has a `prebuild`. What does it do, and why is it wired that way?

**A:** `package.json:8` `"prebuild": "node scripts/build-search-index.mjs"` — npm/pnpm run `prebuild` automatically before `build`. The script (`scripts/build-search-index.mjs`) regenerates `public/search-data.json` from `content/chapters/*.md` (strips headings/blockquotes, joins into plain text, `toSearchContent`). Wiring it into `prebuild` guarantees deterministic, current search data on every build with zero manual steps — this replaced the old hand/externally-produced corpus that could silently drift from the book (Q71's history). The content markdown itself is hand-authored and committed; only the derived corpus is generated.

### Q70. The `search-data.json` is generated by prebuild, not committed-by-hand. What drift risk remains?

**A:** The corpus is generated at build from `content/chapters/*.md` (Q69), which closes the markdown-vs-search drift. Remaining risks: (1) if a chapter is added but the markdown filename breaks the `endsWith('.md')` filter, or the H1 regex (`/^#\s+(.*)/m`) fails, the entry is missing or mistitled; (2) the file is served at a fixed URL with no hash — a stale browser/CDN cache after a content update won't refresh (Q58, Q103); (3) the prebuild and `contentLoader` both read the same directory but with slightly different title/extraction logic — they should stay in sync. The single-source-of-truth is the markdown; the build pipelines (render + search) must both key off it.

### Q71. `scripts/build-search-index.mjs` is a small Node script. How does it differ from the Python extraction scripts in `scripts/`?

**A:** `build-search-index.mjs` is a **Node** CI/build-time script (uses `node:fs/promises`, `node:path`) that runs in `prebuild` to derive the search corpus — it's part of the build pipeline and deterministic. The Python scripts (`scripts/docx_to_md.py`, `inject_docx_images.py`, `word_diff.py`) are **manual, one-time/occasional extraction tools**: they read the source `content/ar-basaar.docx` (python-docx) and segment it into the 13 `.md` chapters. They are not wired into the build; they're run by the author when the source book changes (and they carry stale-path drift, Q11). So: Node for build-time derivation; Python for upstream authoring-time extraction. Mixing both in `scripts/` is fine, but the Python tools would benefit from a README note and CI-free-path cleanup.

### Q72. Why is flexsearch the right search choice for this app vs Postgres FTS or Meilisearch?

**A:** This is a fully static export with **no server** — so any server-backed search (Postgres FTS, Meilisearch, Algolia) is off the table unless a third-party/SaaS endpoint is added. FlexSearch runs entirely client-side: it's a zero-server, offline-capable (PWA) index that fits in the static-host model, with Arabic-friendly `tokenize:'forward'` support (Q9). The corpus is only 13 chapters (~1.7 MB), far below where client index-build cost is a problem. Trade-offs: the full corpus ships to the client (no progressive disclosure), and there's no server-side ranking/typo tolerance out of the box. For 13 chapters, client FlexSearch is the pragmatic, architecture-consistent choice.

### Q73. There's no `.env` requirement anymore. What env does the app actually read?

**A:** The only env read in the whole source is `app/sitemap.ts:6` — `process.env.NEXT_PUBLIC_BASE_URL` (optional, falls back to a stale Vercel default). After the auth removal there are **no** auth-related `NEXT_PUBLIC_*` reads (that's why the static build works with no env). `next/font`/sharp/etc. need no env. So the deployment contract is trivial: nothing required; optionally set `NEXT_PUBLIC_BASE_URL` to the real domain so the sitemap emits production URLs instead of the Vercel default (`app/sitemap.ts:6`).

### Q74. How would you type the `search-data.json` shape to prevent drift between the script and the client?

**A:** Define a shared `SearchDocument` interface (`lib/search.ts:1-6` already has `{id, title, content, slug}`) and ensure `scripts/build-search-index.mjs` emits exactly that shape (it currently uses an ad-hoc object literal — `build-search-index.mjs` maps each file to `{id, title, content, slug}`). Because the script is plain `.mjs` (no TS), there's no compile-time link; the client casts `fetch("/search-data.json")` JSON to `SearchDocument[]` (`components/SearchDialog.tsx:49`). To close the gap: (a) validate the fetched JSON at runtime (a lightweight schema check or Zod), or (b) generate a typed JSON schema from the script and `import` the type. For a 13-chapter book this is low-risk, but a runtime guard would catch a malformed prebuild output (currently it would fail silently into an empty index, `components/SearchDialog.tsx:66-70`).

### Q75. What's the build pipeline from source to `out/`, and where could a candidate add caching/optimization?

**A:** `pnpm build` → `prebuild` runs `scripts/build-search-index.mjs` (writes `public/search-data.json`) → `next build --webpack` (eslint/typecheck optional; webpack chosen for `fs` safety, Q12) → static export to `out/` with Serwist generating `public/sw.js`. Optimization hooks: (1) pre-optimize the 522 images at build with a sharp script (Q10) since `images.unoptimized: true`; (2) hash `search-data.json` filename + reference via a generated manifest to enable cache-busting (Q58/Q103); (3) add a Brotli/gzip compression step for the static host; (4) add `lastmod` to the sitemap (Q24). The pipeline is simple and deterministic — the explicit prebuild is the seam where derived artifacts (search corpus, image variants, hashed manifests) belong.

---

## Round 4: Problem-Solving, Debugging & System Evolution (25 questions)

### Q76. A user's bookmarks don't appear after switching to a new device (same browser profile). Diagnose.

**A:** Bookmarks are stored in `localStorage` under `basaar-bookmarks` (`lib/bookmarks.ts:1`). `localStorage` is **per-origin, per-browser/profile, per-device** — it is not synced between devices by the site. So on a new device there are no bookmarks by design (there's no backend/account to pull from; that was removed in `5f0ced6`). If the user expected cross-device sync, the answer is: this architecture doesn't provide it (Q6). Within a single device, likely causes: (1) cookies/site-data cleared (localStorage wiped), (2) a different browser profile/incognito (separate storage), (3) data written on the chapter page but the sidebar on a *different* origin/port not seeing it (storage is per-origin). Check DevTools → Application → Local Storage. To fix the expectation: add cross-device sync (Q61) or document that bookmarks are per-device.

### Q77. Search returns stale results (missing recent content edits). Diagnose.

**A:** Search reads `public/search-data.json` (`components/SearchDialog.tsx:48`), which is regenerated by `prebuild` at build time (`package.json:8`, Q69). So if a chapter's markdown was edited but the **deployed build wasn't rebuilt/redeployed**, the served corpus is stale. Additionally, the file is fetched at a fixed URL with no hash (Q58) — even after a redeploy, a browser with a cached copy of `search-data.json` will reuse the old one until the host's cache TTL elapses or is busted. Diagnosis: (1) confirm the build was rerun after the edit (`scripts/build-search-index.mjs` output), (2) check the hosted `search-data.json` corresponds to the new build, (3) clear/hard-refresh to rule out a client cache. Fix: hash the filename (Q103) and/or set a short cache TTL for `.json` on the static host.

### Q78. Chapter images are huge (58 MB / 522 files). How do you fix it under static export?

**A:** Under `output: "export"` + `images.unoptimized: true` (`next.config.ts:12-14`), `next/image` does **not** optimize at runtime — so the fix must happen at **build time**. Recommended: (1) add a build script (e.g. a `scripts/optimize-images.mjs` using `sharp`, already a dependency, `package.json:28`) that walks `public/images/**`, produces responsive/AVIF/WebP variants (and downscales), writing optimized files; (2) in `app/chapter/[slug]/page.tsx` add `components={{ img: ... }}` to `ReactMarkdown` (`:61`) choosing the optimized variant per viewport (`srcSet`) — or pre-build the markdown's `<img>` to reference the optimized files; (3) wire the script into `prebuild`. This typically cuts 80%+ (`png`→`avif`/`webp`). Because there's no runtime optimizer, the optimization must be committed/built, not on-demand.

### Q79. The SW doesn't show a custom offline page. How do you add one?

**A:** `sw.ts` has no `setCatchHandler`/`offlineFallback` (Q2). Add: precache `/offline` (a route you create, `app/offline/page.tsx`), then in `sw.ts`: `serwist.setDefaultFallbackUrls({ document: '/offline' })` or a `setCatchHandler` returning the cached `/offline` for navigation failures. Then a fully-uncached deep link offline shows the offline page instead of the browser's default. Serwist supports `fallbacks` config. Test with `context.setOffline(true)` + navigate to an uncached URL. This closes the Q2 gap and strengthens the PWA's "offline book" promise.

### Q80. A user reports the PWA shows an old version after a redeploy. Diagnose the SW.

**A:** `skipWaiting + clientsClaim` (`sw.ts:7-8`) should activate the new SW immediately. If not updating: (1) the precache manifest (`self.__SW_MANIFEST`) didn't change (no asset hash change) → SW sees "no update." Verify the build produced new hashed assets and that `public/sw.js` was regenerated (it's gitignored and rebuilt per deploy, Q50). (2) The browser cached `sw.js` itself — the SW file must be served with no-cache/CORS headers or the browser keeps the old SW script; configure on the static host. (3) `navigationPreload` serving a stale document. Debug: DevTools → Application → Service Workers; check the served `sw.js` vs the built one. The `reloadOnOnline` (`next.config.ts:7`) should also force a reload on reconnect.

### Q81. How would you add full-text search with highlighting and ranking?

**A:** Beyond flexsearch: (1) **Highlight matches** in excerpts — `extractExcerpt` (`lib/search.ts:15`) could wrap the query term in `<mark>` (escape regex first). (2) **Ranking** — flexsearch returns matches; rank by field (title > content) + frequency; the current dedupe (`components/SearchDialog.tsx:87-103`) already collapses per-field hits. (3) For Arabic, normalize (strip harakat, unify alef variants) during prebuild *and* at query time before matching — the prebuild `toSearchContent` and `extractExcerpt`'s `indexOf` (`lib/search.ts:19`) are both currently raw. (4) For scale, a server endpoint with Postgres FTS (Arabic config) or Meilisearch — but that breaks the static/no-server model (Q72). For 13 chapters, flexsearch + normalization + highlighting is plenty. The current search works; normalization + highlighting are the main UX gaps.

### Q82. A user bookmarks a chapter on desktop but it's gone when they reopen the browser. Diagnose.

**A:** Bookmarks live in `localStorage` (`basaar-bookmarks`, `lib/bookmarks.ts:1`). If they disappear on browser reopen, the most likely cause is the browser **evicting/clearing site data** — e.g. an aggressive "clear cookies and site data on exit" setting, an incognito/private session (session-only storage), or a privacy extension. They would also vanish if the user manually cleared site data. Diagnosis: DevTools → Application → Local Storage → `https://<origin>` → check `basaar-bookmarks` after reload. There's no remote backup (by design), so eviction is data loss. Mitigations: persist to `IndexedDB` as a more durable store, show an in-app "your bookmarks are stored on this device" note, or add account sync (Q61). This is an inherent risk of the localStorage-only design (Q6).

### Q83. How would you add reading-progress sync (across devices)?

**A:** Currently `basaar-reading-progress` is localStorage-only (`lib/readingProgress.ts:1`). To sync: (1) reintroduce a `reading_progress` store keyed by `(user_id, chapter_id)` with RLS (or a serverless backend) once accounts exist (Q61); (2) on scroll (debounced — `ReadingProgressBar` already throttles with rAF, `components/ReadingProgressBar.tsx:48-60`), upsert the percentage; (3) on chapter open, fetch latest progress + restore scroll (the component already restores from local on mount, `:42-46`). Last-write-wins per chapter is fine (per-chapter, not whole-account, avoids contention). The `ReadingProgressBar` already tracks scroll; wiring it to a remote store is the only change. Trade-off: more writes than bookmarks (rate-limit consideration). This extends the personalization across devices.

### Q84. The Python scripts have stale paths (`web/public/images`). How do you fix and prevent recurrence?

**A:** `scripts/inject_docx_images.py:10` `IMAGES_OUT_DIR = 'web/public/images'` — the `web/` doesn't exist (flat layout now). Fix: `'public/images'`. Prevent recurrence: (1) the script should derive paths from `process.cwd()`/`__file__` (relative to repo root), not hardcode; (2) a CI check that the scripts run cleanly against fixtures (catch path drift); (3) align `scripts/word_diff.py` ranges with `scripts/docx_to_md.py` (they disagree, Q11); (4) add a note in `scripts/` documenting what each one is for and when to run it (authoring-time vs build-time, Q71). The Python scripts are un-tested, un-CI'd — that's why they rotted.

### Q85. How would you migrate the SW to add per-route strategies (e.g., NetworkFirst for navigations vs CacheFirst for images)?

**A:** Replace `runtimeCaching: defaultCache` (`sw.ts:10`) with an explicit array: `runtimeCaching: [ { urlPattern: /.*\/chapter\/.*/, handler: 'NetworkFirst', options: { cacheName: 'chapter-nav' } }, { urlPattern: /\.(js|css|woff2|png|jpg|webp|avif)$/, handler: 'CacheFirst', ... }, { urlPattern: /^https:\/\/.*$/, handler: 'NetworkFirst', options: { ... } } ]`. This gives fine control (network-first for recently-updated navigations, cache-first for immutable assets). Serwist supports this (Workbox-style). The `defaultCache` preset is the zero-config start; customizing is the next step when defaults don't fit (e.g. to handle the hash-less `search-data.json` stale-cache problem, Q58, with a SWR strategy).

### Q86. How would you add a CSP without breaking the inline theme script?

**A:** (1) **Hash-based**: compute the SHA-256 of the inline script's content (`app/layout.tsx:39-41`) and set CSP `script-src 'self' 'sha256-<hash>'` at the host. Simple and content-stable. (2) **Nonce-based**: generate a per-request nonce and add it to the script + CSP — but under static export there's no per-request server to mint nonces, so this favors the **hash** approach (or extracting the script content to a constant so the hash is fixed). Either works without `'unsafe-inline'`. This enables a real CSP for the static deploy (Q19/Q59). The hash approach is the pragmatic fit for a static website.

### Q87. How do you safely remove the known dead artifacts (stale `start` script, stale image path)?

**A:** (1) `package.json:9` `start: "next start"` is broken under export — replace with `"start": "serve out"` (add `serve` as a devDep) or drop it. (2) `scripts/inject_docx_images.py:10` `web/public/images` → `public/images`. (3) `app/sitemap.ts:6` stale Vercel default → the real domain or leave the env override. After each: `pnpm build` to confirm nothing breaks (the `start` script isn't part of `build`; e2e references it via `playwright.config.ts`, so switching to `serve out/` keeps e2e working). Add `knip`/`depcheck` to CI to catch future dead code. The risk of each is low; grep before removing confirms no import references.

### Q88. How would you add a "dark mode auto" (follow system) vs explicit toggle?

**A:** The inline theme script (`app/layout.tsx:39-41`) already falls back to `prefers-color-scheme` when no stored preference exists. `Navbar.toggleTheme` persists an explicit `light`/`dark` choice to `localStorage('theme')` and dispatches `basaar-theme-change` (`components/Navbar.tsx:27-31`). To add "auto": a 3-state toggle (light/dark/auto), where "auto" clears the stored preference and defers to `prefers-color-scheme` (the script's default). Store `'auto'|'light'|'dark'`. The script: if stored is 'auto' or absent, use `prefers-color-scheme`; else use stored. Add a `matchMedia('(prefers-color-scheme: dark)')` listener to live-update when the system theme changes while in auto mode.

### Q89. A contributor adds a 14th chapter but it doesn't appear. Diagnose.

**A:** `getAllChapters` (`lib/contentLoader.ts:18`) reads `content/chapters/*.md`. If the new `.md` is there, it should appear. Causes for absence: (1) filename doesn't end in `.md` (`:27`); (2) the regex extracting `# title` fails (no H1) → the chapter has no readable title (`:34-35`); (3) the sort places it unexpectedly (numeric suffix mismatch, `:49-61`); (4) `search-data.json` wasn't regenerated (so search misses it, but the grid shows it — rerun `prebuild`/`build`, Q69); (5) the SW is serving a cached old build (no new chapter until SW updates, Q80); (6) `generateStaticParams` didn't pick it up on rebuild (`app/chapter/[slug]/page.tsx:11-16`). Debug: `console.log(getAllChapters().map(c => c.id))` at build; verify the file parses and the page was regenerated in `out/`.

### Q90. How would you add user annotations/notes per chapter?

**A:** With no backend, annotations would be localStorage-only (like bookmarks): (1) an `Annotation[]` store keyed per chapter (`basaar-annotations`, shape `{chapterId, selectionText, note, quoteRange, updatedAt}`); (2) a text-selection UI (highlight text → "add note" popover, similar to the bookmark pattern); (3) render existing annotations as highlights in the chapter (requires mapping a selection to a DOM range — non-trivial with react-markdown output, Q10); (4) sync via the same `bookmarks-updated`-style CustomEvent or a dedicated `annotations-updated` event. The hard part is mapping a user's text selection to a stable position (text offsets shift if content changes); anchoring to paragraph + offset is more stable. If cross-device notes matter, reintroduce a backend (Q61). This is a medium-lift feature.

### Q91. How would you test the bookmark CustomEvent sync (BookmarkButton → BookmarkedChapters)?

**A:** Component/integration test: render `BookmarkedChapters` in jsdom, assert it renders `null` with no bookmarks; mock `lib/bookmarks` (or provide a `localStorage`-backed store) so one chapter is bookmarked, render `BookmarkButton`, click it (toggles + dispatches `bookmarks-updated`), assert the sidebar list updates. Cross-tab: dispatch a `storage` event and assert a re-render. Because both components are pure over `lib/bookmarks` + the event name, the test is straightforward with RTL. Currently the event wiring is only lightly covered by e2e (Q63/Q65) — this unit/integration test is the gap. A senior note: the event name is stringly-typed (`'bookmarks-updated'`), so a constant export would make the test and the code less prone to typo-drift.

### Q92. How would you add social sharing per chapter?

**A:** (1) A `<ShareButton>` (Web Share API + clipboard fallback) on the chapter page. (2) `generateMetadata` already returns per-chapter title/description (`app/chapter/[slug]/page.tsx:18-31`); add `openGraph.images` (a per-chapter OG image — could be the chapter's first image or a branded template). (3) The share URL is the chapter's canonical (`/chapter/<slug>`). For a static site, OG images should be pre-generated at build (sharp, Q78) rather than via a server endpoint. WhatsApp/Facebook shares then show the chapter title + image. This is straightforward; the metadata foundation exists.

### Q93. The `README.md` used to say "Next.js 15" but the app is 16. How do you prevent docs version drift?

**A:** A version badge is classic rot if hand-maintained (the "15" → "16" fix is done). Prevent recurrence: (1) generate badges from `package.json` (shields.io supports a JSON-source badge), (2) a CI check grepping README/docs for hardcoded version numbers and comparing to `package.json`, (3) treat docs like code — a PR bumping Next also updates README in the same PR, (4) add version-stamp headers ("accurate as of <version>") and archive stale docs. README extraction drift (PDF vs DOCX, Q11) arose the same way — nothing enforced freshness. The meta-fix is a CI docs check (Q105), not one-off edits.

### Q94. How would you add audio narration per chapter?

**A:** (1) Source audio (a narrator's recitation of each chapter); name by slug. (2) An `<AudioPlayer>` on the chapter page (new client component). (3) Preload the current chapter; lazy-load others. (4) Sync highlighting with playback (if word-level timing is available). (5) PWA: audio is large; either stream (range requests) or offer explicit download given the static/no-server model. Challenges: finding a narrator, file sizes (large on a static host), licensing. The book's length (900 pages) makes full narration a massive effort — maybe per-section. The audio is independent of the text pipeline.

### Q95. A teammate wants Redux for bookmark state. Respond.

**A:** Current bookmark state: `localStorage` (one key) + a custom event bus (`bookmarks-updated`) + two consumers (desktop `Sidebar` and mobile `MobileMenu`). It's distributed but works. Redux would centralize but add boilerplate and a dependency with no server surface to justify it. Ask "What's broken?" If the event bus is fragile (stringly-typed, global), a small Zustand store (lighter than Redux) for bookmarks would clean it — `useBookmarks()` selector, no event bus. But the current system works; the lift isn't justified unless the event-bus approach causes bugs. For now, the custom-event + localStorage is adequate; Zustand is the natural upgrade if complexity grows (e.g., annotations, Q90, or more bulletin-board-style shared state).

### Q96. How would you add i18n (Arabic-only currently)?

**A:** The audience is Arabic readers; i18n is low-priority. If wanted: next-intl or i18next. Extract Arabic UI strings, `[locale]` routing, RTL→LTR audit. The content (the book) is Arabic-only (translation is a massive scholarly effort). For a diaspora audience, English UI + Arabic content could work. Unlike a portfolio, the content defines the audience — i18n is optional. The current Arabic-only with `<html lang="ar" dir="rtl">` (`app/layout.tsx:37`) is correct for the target user.

### Q97. How would you add analytics (which chapters are read most)?

**A:** Privacy-friendly (Plausible/Umami): track `/chapter/<slug>` pageviews (automatic), bookmark toggles, search queries (aggregate top-N, not raw). For a book, "most-read chapters" + "drop-off points" are valuable. Client-side events (the app is static). Env-gate to production. Important: with a static export and no server, analytics are **client-side only** — a self-hosted Plausible script or a third-party snippet added to `app/layout.tsx`. Configure the analytics domain via `NEXT_PUBLIC_*`. Avoid logging raw search text (potential sensitivity). Lazy-load the analytics script so it doesn't hurt LCP.

### Q98. How would you add the install prompt's dismiss state so it doesn't nag every page load?

**A:** `InstallPrompt` currently shows whenever `beforeinstallprompt` fires and `!installed` (`components/InstallPrompt.tsx:19-54`), but has no persistence of a user "no thanks". Add a `basaar-install-dismissed` flag in `localStorage`: when the user dismisses (`onclick` of the X, `:73-79`, or the `show=false`), set it; the component skips `setShow(true)` if the flag is set (`:23-27`) or auto-hides after a few pageviews. This is a small, client-side improvement — no backend needed (Q6 pattern). A senior note: combine with the `matchMedia` standalone check (`:16`) so installed users are never prompted.

### Q99. How would you add a "reading progress" header/summary (percent of book read)?

**A:** Derive from the existing `localStorage` progress store (`basaar-reading-progress`, an array of `{chapterId, scrollPercentage, updatedAt}`, `lib/readingProgress.ts:1-37`). A client component (e.g. in `Sidebar` or the home page) sum `/ chapterCount` of each chapter's `scrollPercentage` (or count chapters with `scrollPercentage > 0`). Because progress is per-device localStorage, the summary is per-device. Add it as a small card/list-item that reads the store and re-renders on a `progress-updated`-style event (or a `storage` listener like `BookmarkedChapters`, Q14). No backend. This is a cheap, high-value "bookshelf" feature given the data already exists.

### Q100. Onboarding a new dev: 5-step guide?

**A:** 1. Read `AGENTS.md` (README + verification gates) + `docs/README.md` + `docs/SENIOR_INTERVIEW_QUESTIONS.md` (the current-architecture walkthrough) + `README.md` (note the stale extraction drift, PDF vs DOCX). 2. `pnpm install && pnpm dev` (note `--webpack`, Q12); visit `/`, open a chapter, try search (Ctrl+K), bookmark a chapter, toggle theme. 3. Trace a chapter: `content/chapters/*.md` → `lib/contentLoader.ts` → `app/chapter/[slug]/page.tsx` → react-markdown. Trace a bookmark: `components/BookmarkButton.tsx` → `lib/bookmarks.ts` → `components/BookmarkedChapters.tsx` (via the `bookmarks-updated` event). Trace search: `scripts/build-search-index.mjs` (prebuild) → `public/search-data.json` → `components/SearchDialog.tsx`. 4. Verify with the gates: `pnpm test:static` (lint+typecheck), `pnpm test` (vitest), `pnpm test:e2e` (needs build first). 5. Know the constraints: fully static export (`output: "export"`, no server/middleware/route handlers), localStorage-only personalization, images unoptimized (Q10). Warn: README extraction drift (PDF→DOCX), dead `start` script, no cross-device sync.

---

## Bonus Round: Stretch Questions (5 questions)

### Q101. The markdown images bypass `next/image` and are unoptimized (58 MB). Design the complete build-time fix.

**A:** Because `output: "export"` + `images.unoptimized: true` means no runtime optimizer: (1) Add `scripts/optimize-images.mjs` (using `sharp`, already a dep, `package.json:28`) that walks `public/images/**` and writes AVIF/WebP + downscaled variants (e.g. `img-001.avif`, `img-001-800.webp`), wired into `prebuild`/a build step. (2) In `app/chapter/[slug]/page.tsx`, add a `components={{ img: ({src, alt, ...p}) => <img src={optimize(src)} alt={alt} srcSet={...} loading="lazy" {...p} /> }}` override on `ReactMarkdown` (`:61`) that picks the built variants, or rewrite the markdown at build to emit the optimized sources. (3) Handle the `<p>`-wrapping (react-markdown wraps images) to avoid layout overflow — set the image classes (`w-full h-auto`). (4) Keep the originals out of the deploy if the optimized set fully replaces them. Result: 522 images get responsive sources + AVIF/WebP + lazy-load — typically ~80% size cut, all at build time, no server required. Verify on a chapter with many images (e.g. `chapter-10`).

### Q102. The SW has no offline fallback. Design the complete offline UX.

**A:** (1) Create `app/offline/page.tsx` (a static Arabic "you're offline, cached content available" page). (2) In `sw.ts`, add `fallbacks: { document: '/offline', image: '/offline-cover.png' }` (Serwist API) or a `setCatchHandler` returning the cached `/offline` for navigation failures. (3) Ensure `/offline` is in the precache manifest (it's a static route, so `defaultCache`/manifest should include it — verify). (4) Test: `context.setOffline(true)` → navigate to an uncached URL → assert `/offline` renders. (5) For cached chapters, offline navigation should serve the cached HTML (the precache + navigation preload handle this). The `reloadOnOnline` (`next.config.ts:7`) reloads on reconnect. This makes the PWA robust offline end-to-end and matches the "offline book" product promise.

### Q103. Design a cache-busting strategy for `search-data.json` (and other derived artifacts) on a static host.

**A:** (1) In `scripts/build-search-index.mjs`, write `public/search-data.[hash].json` (hash of the content/JSON) and emit/update a small manifest (e.g. `public/build-manifest.json` mapping `search-data` → current filename). (2) In `components/SearchDialog.tsx:48`, fetch the filename from the manifest (or bake the hash into a build-time constant the client imports). This busts stale caches when content changes (Q58/Q77). (3) For images (Q78/Q101), hash-embed the new variants similarly, or rely on new filenames. (4) At the static host, set reasonable cache TTLs: short (`no-cache`) for `index.html`/`search-data*.json`, long (`immutable`) for hashed `_next/static/*`. Because there's no Next `headers()`, all of this is host config — make it part of the deploy notes (docs/README).

### Q104. The old auth callback used a "dual-cookie trick." Why was it subtle, and what replaced it?

**A:** Under the removed server-auth stack, `app/auth/callback/route.ts` had to write auth cookies to **both** `request.cookies` (so subsequent reads in the same request saw the session) **and** `response.cookies` (so the browser persisted them). Omitting either broke auth silently — this was a HIGH-risk bug during the Next 16 upgrade. That entire pattern is now **gone** (commit `5f0ced6`): there is no auth callback, no SSR cookies, no route handler at all — the app is a static export with no server session. The lesson a senior should carry forward: session/SSR-cookie subtleties were a consequence of server-side auth; moving to a fully client-side, serverless model eliminated that class of bugs entirely, at the cost of no real accounts. If auth returns (Q61), the dual-write cookie contract (or a Session storage strategy) would need to be reintroduced — but only if a server/handler layer returns too.

### Q105. Docs drift was significant (PDF→DOCX, stale "Next 15", removed auth). Design a docs-freshness process.

**A:** (1) **Single source for facts** — versions, file paths, scripts: derive from `package.json`/source, don't hand-maintain in README. (2) **Generate badges** — shields.io from `package.json` (version badges auto-update). (3) **CI docs check** — a script: (a) grep README/docs for hardcoded versions, compare to `package.json`; (b) verify cited file paths exist; (c) verify claimed scripts exist in `package.json`; (d) flag known-drift patterns ("PyMuPDF", "Next 15", removed-auth remnants); (e) verify every `file:line` cited in docs exists. (4) **Version-stamp** — "accurate as of <version>" headers; archive stale docs (e.g. `upgrade-nextjs.md` is now a historical record with a Status section). (5) **PR rule** — behavior-changing PRs update docs same-PR. (6) **Audit cycle** — quarterly docs review (like this one). This repo's docs rotted (PDF→DOCX, version, removed-auth remnants) because nothing enforced freshness; the fix is process + CI, not one-off edits.

---

## Evaluation Criteria

| Area | Mid | Senior | Staff |
|------|-----|--------|-------|
| **Architecture** | Explains SSG/static-export + client-side personalization split | Debates SW defaultCache vs custom | Designs the build-time image optimization + offline-fallback pipeline |
| **React/Next** | Identifies server/client components | Diagnoses the `useSyncExternalStore`/hydration-safe theme & progress patterns | Designs the markdown→build-time-image-optimization + CSP-hash approach |
| **State/Storage** | Knows what localStorage is for this app | Explains the `bookmarks-updated` event-bus trade-offs | Designs cross-device sync (localStorage → backend) + cache-busting |
| **PWA** | Knows what a SW does | Diagnoses skipWaiting/clientsClaim deploy behavior | Designs per-route SW strategies + offline fallback |
| **Search** | Explains flexsearch client-side | Diagnoses search-data staleness + Arabic normalization | Designs the build-search-index + cache-busting + typed corpus |
| **Security** | Knows headers belong on the host for static export | Explains why no-CSP + the inline-script tension | Designs CSP via hash + HSTS for the static deploy |
| **Performance** | Knows static export is fast | Diagnoses the 58MB unoptimized images under `unoptimized` | Designs the build-time markdown→optimized-image routing |
| **Maintainability** | Notices docs drift | Catalogs README/script/artifact drift | Designs the docs-freshness CI process |

---

*End of interview document. 105 questions across 5 rounds. All file/function references verified against the current bassaer static-export codebase.*
