# Q&A Guide — Basaar

> **Purpose:** Prepare the presenter for expected questions after the demo. Each question includes a concise answer
> (30–60 seconds of speaking), a real code source, an honest limitation, and a proposed improvement.

---

## Module 1: System Architecture and Data Flow (Q1–Q6)

---

### Q1: How does data flow from the manuscript to the screen?

**Answer:**
The manuscript (.docx) is converted to Markdown files via a Python script. During the site build
(`next build`), Markdown files are read from `content/chapters/` and baked into ready-made HTML
pages (Static Site Generation). In the browser, React reads the content from the DOM and creates
an interactive tree — this is the hydration step.

**Source:** `lib/contentLoader.ts:4` — path `content/chapters/` ;
`app/chapter/[slug]/page.tsx:33-38` — reading content at build time.

**Limitation/Gap:** Data only changes when you rebuild (`next build`). There is no live data
update at runtime.

**Proposed improvement:** Automate YAML build for chapter metadata instead of extracting the title
from the first h1 line.

---

### Q2: Why did we choose static export instead of SSR or an API?

**Answer:**
The `output: "export"` setting in `next.config.ts:12` makes Next.js produce static HTML files
only. This means: no Node.js server required at runtime, no database, no Lambda.
Zero server cost, and maximum performance because content is served directly from a CDN.

**Source:** `next.config.ts:12` — `output: "export"`.

**Limitation/Gap:** Complex Server Components, API Routes, and live data updates cannot be used.
Any content change requires a rebuild and redeployment.

**Proposed improvement:** If the project later needs live updates, migrating to Next.js
with a standard deployment (Node server) or Edge Functions is a difficult change without restructuring.

---

### Q3: How does the "server" here differ from a traditional API?

**Answer:**
There is no server at runtime here. The server exists only at build time: it reads
Markdown files and outputs HTML. After deployment, files are hosted on a CDN only — no Lambda,
no database, no POST requests. This differs from a traditional API that processes requests every time.

**Source:** `next.config.ts:12` — `output: "export"` ;
`vercel.json:1` — empty (no server settings).

**Limitation/Gap:** Any feature requiring a server (e.g. push notifications, account syncing)
requires rebuilding the entire infrastructure.

**Proposed improvement:** Use Vercel Serverless Functions for services that need a server
(sync, notifications) while keeping the static export for content.

---

### Q4: How are pages built? Is there a file for each chapter?

**Answer:**
Yes. Each chapter has a file in `content/chapters/`. The `generateStaticParams` function in
`app/chapter/[slug]/page.tsx:11-16` reads all chapters and generates a path for each one.
At build time, Next.js produces a separate HTML file for every chapter.

**Source:** `app/chapter/[slug]/page.tsx:11-16` — `generateStaticParams` ;
`lib/contentLoader.ts:18-62` — `getAllChapters`.

**Limitation/Gap:** Chapters must exist in `content/chapters/` at build time. Adding a new chapter
requires a rebuild and redeployment.

**Proposed improvement:** Add a build script that checks for duplicate chapter IDs and issues a
layout warning in case of conflicts.

---

### Q5: What happens when a nonexistent path is requested?

**Answer:**
The file `app/not-found.tsx` displays a 404 page with an RTL-compatible Arabic design. In an
Apache environment, nonexistent requests are redirected to `404.html` via
`public/.htaccess:1`. There is no dynamic routing — everything is static.

**Source:** `app/not-found.tsx:3-20` — 404 page ;
`public/.htaccess:1` — `ErrorDocument 404 /404.html`.

**Limitation/Gap:** The 404 page has no search or suggestions. The user has no way to know
their path is wrong beyond the error message.

**Proposed improvement:** Add smart suggestions on the 404 page (search for words from the
misspelled path) to improve the user experience.

---

### Q6: How are reading progress and bookmarks saved without a server?

**Answer:**
Everything is stored in `localStorage` in the user's browser. Bookmarks
are stored under the key `basaar-bookmarks` in `lib/bookmarks.ts:1`,
and reading progress under the key `basaar-reading-progress` in
`lib/readingProgress.ts:1`. There is no server or API involved.

**Source:** `lib/bookmarks.ts:1` — key `basaar-bookmarks` ;
`lib/readingProgress.ts:1` — key `basaar-reading-progress`.

**Limitation/Gap:** Data stays in the browser only — no cross-device or cross-browser
synchronization.

**Proposed improvement:** Add export/import for data via JSON file to manually transfer
data to another device.

---

## Module 2: Hydration and Client State (Q7–Q13)

---

### Q7: What is the difference between the server-rendered HTML and what the browser displays?

**Answer:**
The server (or build step) produces HTML containing the full text content but without
interactivity. When the page loads in the browser, JavaScript is loaded and React rebuilds the
DOM tree and wires up event handlers — this is hydration. The gap between the original HTML
and the hydrated DOM is the source of the mismatch.

**Source:** `app/layout.tsx:29-49` — root component (Server Component) ;
`components/ClientShell.tsx:1-39` — client boundary.

**Limitation/Gap:** If a component reads data from `localStorage` during server-side render,
the value will differ from the client → hydration error.

**Proposed improvement:** Use `useSyncExternalStore` with a fixed server snapshot
(as in `Navbar.tsx:23`) to avoid any divergence.

---

### Q8: When exactly does hydration happen?

**Answer:**
It happens after JavaScript is loaded and the initial function executes. In this app, a
`<script>` in `layout.tsx:39-41` reads localStorage and adds the "dark" class
before hydration. The hydration itself happens when React loads and wires up
`ClientShell` with event handlers.

**Source:** `layout.tsx:39-41` — early theme script ;
`components/ClientShell.tsx:1-3` — "use client" boundary.

**Limitation/Gap:** We cannot pinpoint the exact hydration moment — it depends on file
load speed and processor speed.

**Proposed improvement:** Use `onLoad` callback or `reportWebVitals` to measure
the actual hydration time.

---

### Q9: Why does getSnapshot return zero on the server?

**Answer:**
In `Navbar.tsx:20-24`, the `useSyncExternalStore` function takes 3 arguments:
subscribe, getSnapshot (for the client), and getServerSnapshot. The third argument
`() => false` returns a fixed value on the server because `document` is not available in
the Node.js environment. This prevents hydration errors.

**Source:** `Navbar.tsx:20-24` — `useSyncExternalStore(subscribe,
() => document.documentElement.classList.contains("dark"), () => false)`.

**Limitation/Gap:** The value `false` means the dark theme will not appear in the
server-rendered HTML — the user sees a flash before hydration.

**Proposed improvement:** The same inline script pattern in `layout.tsx:39-41` solves this problem proactively — which is exactly what we are already doing.

---

### Q10: How do safe patterns prevent mismatch?

**Answer:**
The `<html ... suppressHydrationWarning>` line in `layout.tsx:37` tells React
to ignore hydration differences on the `<html>` element. The reason: the inline script in
`layout.tsx:39-41` adds `class="dark"` on the client before hydration, but the original HTML
does not contain it. Without `suppressHydrationWarning`, a console warning would appear.

**Source:** `layout.tsx:37` — `suppressHydrationWarning` ;
`layout.tsx:39-41` — inline script for theme.

**Limitation/Gap:** `suppressHydrationWarning` only hides warnings on the specified
element — it does not fix hydration differences elsewhere.

**Proposed improvement:** Using CSS variables directly instead of class toggling
would eliminate the need for `suppressHydrationWarning` entirely.

---

### Q11: What causes hydration mismatch and how do we mitigate it?

**Answer:**
The main cause: reading `localStorage` during render in an SSR environment. If we read
e.g. bookmarks in a Server Component, the value on the server = null, on the client
= saved data. React detects the difference and shows a hydration error in the console.
Mitigation: we use `useSyncExternalStore` with a fixed server snapshot.

**Source:** `lib/bookmarks.ts:10` — `if (typeof window === "undefined") return []` ;
`lib/readingProgress.ts:10` — same pattern ;
`components/Navbar.tsx:23` — `() => false` as server snapshot.

**Limitation/Gap:** Some components still read localStorage directly in `useEffect`
without sufficient protection → hydration warnings may appear in some cases.

**Proposed improvement:** Use the React 19 hydration API or the `use` hook
to scope safe data reads.

---

### Q12: Does the time gap cause a page repaint? When exactly does this happen?

**Answer:**
Yes. After hydration (when React creates the DOM tree), a re-render occurs to recalculate
values that depend on the client. For example, `ReadingProgressBar` in
`ReadingProgressBar.tsx:19-23` reads `getChapterProgress` — the value on the server
= 0, after hydration = saved progress. This happens once immediately after hydration completes.

**Source:** `ReadingProgressBar.tsx:19-23` — `useSyncExternalStore` with
server snapshot = 0 ;
`ReadingProgressBar.tsx:25-28` — re-render when `savedProgress` changes.

**Limitation/Gap:** If the saved progress is large, a noticeable visual artifact may occur
(parallax in the progress bar).

**Proposed improvement:** Add a smooth animation when loading the saved progress.

---

### Q13: Does the page lose its display state when navigating between chapters?

**Answer:**
No. Chapter navigation uses client-side navigation in Next.js — no full page reload occurs.
`ClientShell` stays loaded for the entire session. `ReadingProgressBar`
recalculates progress for each new chapter because it calls `getChapterProgress(chapterId)` in
`ReadingProgressBar.tsx:42` (inside useEffect) — but it does not lose the overall state.

**Source:** `components/ClientShell.tsx:15-38` — root that stays constant ;
`components/ReadingProgressBar.tsx:30-64` — useEffect recalculates for each chapterId.

**Limitation/Gap:** `SearchDialog` is re-initialized every time it is opened (fetch +
index build) → delay on the first search after each navigation.

**Proposed improvement:** Initialize FlexSearch once in `ClientShell` and pass it as a prop
or context instead of rebuilding on every render.

---

## Module 3: Search and Performance (Q14–Q20)

---

### Q14: Is search instant? What is the algorithm?

**Answer:**
Search uses FlexSearch — a client-side search library. The index is built
when the `SearchDialog` component loads via dynamic import. Search uses
"forward" tokenize — it splits every word into parts from left to right. Results appear
almost instantly because the index is in memory.

**Source:** `components/SearchDialog.tsx:46` — `const FlexSearch = (await import("flexsearch")).default` ;
`components/SearchDialog.tsx:52-60` — FlexSearch.Document setup with `tokenize: "forward"`.

**Limitation/Gap:** The index does not support true full-text search — forward tokenize
does not support wildcard or regex.

**Proposed improvement:** Upgrade to FlexSearch v0.8+ with tokenize "forward" + "bitmap"
to improve recall while maintaining performance.

---

### Q15: How is the search index built?

**Answer:**
The script `scripts/build-search-index.mjs` reads Markdown files from
`content/chapters/`, creates an array of documents (id, title, content, slug),
and writes them to `public/search-data.json`. This happens automatically before the build via
`prebuild` in `package.json:8`.

**Source:** `scripts/build-search-index.mjs:1-47` — the full script ;
`package.json:8` — `"prebuild": "node scripts/build-search-index.mjs"`.

**Limitation/Gap:** File size = 1,753,076 bytes (~1.7MB) — this is the entire text content
of the book loaded in a single chunk.

**Proposed improvement:** Split content into smaller chunks or use lazy loading
to load only the content that is needed.

---

### Q16: How much data is sent to the client on each page load?

**Answer:**
Main data: `search-data.json` at 1,753,076 bytes (~1.7MB)
containing the full text content of the book. Additionally, 522 images in
`public/images/` are loaded on demand (lazy loading). HTML files for each chapter
are much smaller (a few KB).

**Source:** `public/search-data.json` — 1,753,076 bytes ;
`public/images/` — 522 images in `chapter-*` directories.

**Limitation/Gap:** The 1.7MB is loaded in a single chunk — it impacts initial page
load speed (First Contentful Paint).

**Proposed improvement:** Use a Web Worker to load search-data.json in the background
or split content into smaller per-chapter files.

---

### Q17: How is the performance of this application measured?

**Answer:**
Honestly: there is no performance measurement tool set up currently. The project has a
`playwright.config.ts` but no CI runs Lighthouse or Web Vitals.
Comparisons with external tools like Lighthouse are possible manually but have not been
integrated into the pipeline.

**Source:** `playwright.config.ts:1-19` — Playwright config ;
`package.json:15` — `"test:e2e": "playwright test"`.

**Limitation/Gap:** Core Web Vitals (LCP, CLS, INP) cannot be measured automatically.
There is no production performance monitoring.

**Proposed improvement:** Add the `web-vitals` package and Lighthouse CI reports in
the production pipeline.

---

### Q18: When is FlexSearch loaded on the page?

**Answer:**
It is loaded lazily when the `SearchDialog` component opens. The line
`await import("flexsearch")` in `SearchDialog.tsx:46` loads the library at the
moment the dialog opens only — it does not weigh down the home page.

**Source:** `components/SearchDialog.tsx:46` — `const FlexSearch = (await
import("flexsearch")).default`.

**Limitation/Gap:** The first time search is opened, it requires time (import + fetch + index build).
There may be a noticeable delay on low-end devices.

**Proposed improvement:** Preload FlexSearch early in a `useEffect` in `ClientShell`
when the browser is idle (requestIdleCallback).

---

### Q19: What is the cost of updating the search dropdown on every keystroke?

**Answer:**
On every change in the search field (`SearchDialog.tsx:109-113`), `doSearch` is called
which recalculates the results: `indexRef.current.search(q, { enrich: true,
limit: 20 })` then filters duplicates and determines the excerpt for each result. This happens
client-side only — no network requests.

**Source:** `components/SearchDialog.tsx:75-107` — the `doSearch` function ;
`components/SearchDialog.tsx:82-85` — `search` call with `enrich: true, limit: 20`.

**Limitation/Gap:** There is no debounce — every character triggers a full search recalculation.
On the large content (1.7MB index), this may cause a noticeable lag.

**Proposed improvement:** Add debounce with a 150–200ms delay to reduce the number of search invocations.

---

### Q20: Why did we choose tokenize "forward"?

**Answer:**
The Arabic language suffers from elision — dropping certain letters in connected speech (e.g. «بالكتاب»
= «بـ + الكتاب»). tokenize "forward" splits the word from the left into successive
parts, which allows searching for partial words. This strikes a balance between index size
(slightly larger) and result retrieval (better than exact match).

**Source:** `components/SearchDialog.tsx:58` — `tokenize: "forward"`.

**Limitation/Gap:** It does not support wildcards or full search phrases. The index is larger than tokenize "strict" but recall is better.

**Proposed improvement:** Test tokenize "forward" + "bitmap" from FlexSearch v0.8
to improve performance while maintaining recall.

---

## Module 4: Sync, Storage, and Offline Operation (Q21–Q27)

---

### Q21: Are bookmarks synchronized across different devices?

**Answer:**
No. Bookmarks are stored in `localStorage` — the browser's local storage. The `storage`
event in `BookmarkedChapters.tsx:15` is only heard across tabs within the
same browser. There is no cross-device or cross-browser synchronization.

**Source:** `lib/bookmarks.ts:1` — `localStorage` ;
`components/BookmarkedChapters.tsx:15` — `window.addEventListener("storage", refresh)`.

**Limitation/Gap:** Clearing browser data deletes everything. There is no server-side backup.

**Proposed improvement:** Add export/import for bookmark data via JSON file
or QR code.

---

### Q22: Why is there no sync server?

**Answer:**
The application is built on static export (`next.config.ts:12` — `output: "export"`).
There is no Node.js server at runtime, no API Routes, no database. Adding sync
requires building a full backend — JWT auth + database + real-time sync — which is
outside the scope of the current project.

**Source:** `next.config.ts:12` — `output: "export"` ;
`vercel.json:1` — empty (no server settings).

**Limitation/Gap:** The user loses all bookmarks and progress if they switch to a new
browser or clear browser data.

**Proposed improvement:** Use Cloudflare Workers + D1 as a lightweight sync backend
while keeping the static export for content.

---

### Q23: What exactly is stored locally?

**Answer:**
Three keys in localStorage:
1. `basaar-bookmarks` (`lib/bookmarks.ts:1`) — an array of `{chapterId,
   chapterTitle, timestamp}`.
2. `basaar-reading-progress` (`lib/readingProgress.ts:1`) — an array of
   `{chapterId, scrollPercentage, updatedAt}`.
3. `theme` — read/written directly in `Navbar.tsx:29` and
   `layout.tsx:40`.

**Source:** `lib/bookmarks.ts:1-7` — Bookmark interface ;
`lib/readingProgress.ts:1-7` — ReadingProgress interface ;
`components/Navbar.tsx:29` — `localStorage.setItem("theme", ...)`.

**Limitation/Gap:** There is no automatic cleanup of old data — localStorage size may
grow over time.

**Proposed improvement:** Add TTL (Time-To-Live) for old progress data
(older than 90 days).

---

### Q24: Does storage work offline?

**Answer:**
localStorage always works — it is local storage and does not need a network. Bookmarks,
reading progress, and theme all work offline. But the actual book content
(text and images) requires a server or pre-cached assets.

**Source:** `lib/bookmarks.ts:10-16` — `localStorage` operations ;
`sw.ts:5-11` — Serwist precache (contains only route files and built assets).

**Limitation/Gap:** If the user has not visited a specific page before, its content will not
work offline because it is not in the runtime cache.

**Proposed improvement:** Add `setCatchHandler` in the service worker to display a dedicated
offline page when the network fails.

---

### Q25: What happens when a push notification is requested — does this feature exist?

**Answer:**
Honestly: there is no Push Notifications feature in this application. There is no code
that handles `PushManager` or the `Notification API`. `InstallPrompt.tsx` only
displays a PWA install button — it has nothing to do with notifications. The feature requires a
server to handle Push Subscriptions.

**Source:** `components/InstallPrompt.tsx:1-83` — install button only ;
`sw.ts` — no `self.addEventListener("push")`.

**Limitation/Gap:** The user receives no notification when content is updated
or a new feature is added.

**Proposed improvement:** Add Push Notifications via Vercel Edge Functions
with a subscription endpoint.

---

### Q26: How does the application work offline?

**Answer:**
The application uses Serwist as a Service Worker (`sw.ts:5-11`). It pre-caches
build files (HTML, JS, CSS) via `__SW_MANIFEST`. However,
book content (Markdown images, search-data.json) relies on runtime caching
via `defaultCache` in `sw.ts:10`. If a page has not been visited before, its content will not
work offline.

**Source:** `sw.ts:5-11` — Serwist setup with `precacheEntries` and `runtimeCaching` ;
`next.config.ts:4-9` — Serwist config with `swSrc` and `swDest`.

**Limitation/Gap:** Previously unvisited content does not work offline. There is no
precaching for all book pages (13 chapters + home).

**Proposed improvement:** Add `runtimeCaching` strategy for chapter routes
with stale-while-revalidate to improve the offline experience.

---

### Q27: Is there a fallback page when there is no connection?

**Answer:**
No. There is no `setCatchHandler` in `sw.ts`. If a request fails and is not in the
cache, the browser displays a generic error page rather than a dedicated offline page. This means
the user does not know the problem is a connectivity issue rather than a site error.

**Source:** `sw.ts:5-13` — no `setCatchHandler` or custom `handleFetch` ;
`public/.htaccess` — no redirect to an offline page.

**Limitation/Gap:** The offline user experience is incomplete — there is no explanatory
message or alternative.

**Proposed improvement:** Add an `offline.html` in `public/` and add `setCatchHandler`
in `sw.ts` to display it when the network fails.

---

## Module 5: Quality, Security, and Maintainability (Q28–Q31)

---

### Q28: How secure is this application?

**Answer:**
The application is relatively secure: static-only (no server to attack), no secrets in the code
(`.env.local` contains Supabase vars that are currently unused), and a limited attack surface.
However, there is no Content-Security-Policy header — `.htaccess` only sets
`X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`.

**Source:** `public/.htaccess:3-7` — configured headers (no CSP) ;
`.env.local:4-9` — Supabase vars (dead code).

**Limitation/Gap:** Without CSP, the application is exposed to XSS if a vulnerability exists in
any third-party library (e.g. react-markdown).

**Proposed improvement:** Add CSP headers in `.htaccess` and `vercel.json`
with `script-src 'self'` and `style-src 'self' 'unsafe-inline'`.

---

### Q29: How reliable is this application?

**Answer:**
Static hosting means: no server to go down, no database to stop, no downtime from
traffic spikes. Vercel CDN is very reliable. However, there are no automated E2E tests
in CI — Playwright tests exist (`e2e/*.spec.ts`) but there is no CI pipeline
running them automatically.

**Source:** `e2e/` — 6 Playwright test files ;
`.github/` — not present (no CI config) ;
`package.json:15` — `"test:e2e": "playwright test"` (exists only for manual use).

**Limitation/Gap:** There is no production monitoring — no Sentry, no runtime health checks.
We cannot know if the site is actually running.

**Proposed improvement:** Add a GitHub Actions workflow to run lint + typecheck +
test + build on every PR.

---

### Q30: How do we ensure quality over time?

**Answer:**
Currently: `pnpm lint` (ESLint), `pnpm typecheck` (TypeScript), `pnpm test`
(Vitest). `test:static` combines lint + typecheck. But there is no CI — these
commands must be run manually. There are no component tests (only unit tests
for `lib/` libraries).

**Source:** `package.json:10-14` — scripts: lint, typecheck, test:static, test ;
`lib/__tests__/` — 4 unit test files ;
`vitest.config.ts:1-17` — Vitest config with jsdom.

**Limitation/Gap:** No component tests for React components. No snapshot tests.
No CI pipeline.

**Proposed improvement:** Add:
1. `@testing-library/react` component tests for every major component.
2. GitHub Actions CI workflow.
3. Playwright tests in CI.

---

### Q31: What will change in the next release? (And what claims should the presenter NOT make)

**Answer:**
The plan includes:
1. Offline fallback page with `setCatchHandler`.
2. Component tests for all major components.
3. Better images (image pipeline with next/image optimization).
4. Reduce search corpus size (split into chunks).
5. Clean up dead code (unused Supabase env vars).

**What should NOT be said:**
- "The application works fully offline" (content requires a network).
- "Search is instant" (there is a first-load delay).
- "There is cross-device sync" (localStorage only).
- "There is CI/CD" (no GitHub Actions).
- "The application is fully secure" (no CSP).

**Source:** `.env.local:4-9` — dead Supabase vars ;
`sw.ts:5-13` — no offline fallback ;
`.github/` — not present.

**Limitation/Gap:** Some improvements require major restructuring (e.g. reducing the corpus
requires a new build pipeline).

**Proposed improvement:** Create an official roadmap in README.md with clear priorities
and realistic timelines.

---

## Reference Summary

| File | Lines Referenced |
|-------|----------------------|
| `next.config.ts` | 12 |
| `app/layout.tsx` | 37, 39–41 |
| `app/not-found.tsx` | 3–20 |
| `app/chapter/[slug]/page.tsx` | 11–16, 33–38 |
| `components/Navbar.tsx` | 20–24, 29 |
| `components/ClientShell.tsx` | 15–38 |
| `components/SearchDialog.tsx` | 46, 52–60, 75–107, 109–113 |
| `components/ReadingProgressBar.tsx` | 19–23, 25–28, 30–64 |
| `components/BookmarkedChapters.tsx` | 15 |
| `components/InstallPrompt.tsx` | 1–83 |
| `lib/bookmarks.ts` | 1, 10–16 |
| `lib/readingProgress.ts` | 1, 10–16 |
| `lib/contentLoader.ts` | 4, 18–62 |
| `lib/search.ts` | 1–6 |
| `scripts/build-search-index.mjs` | 1–47 |
| `sw.ts` | 5–11, 10 |
| `public/.htaccess` | 1, 3–7 |
| `public/search-data.json` | (1,753,076 bytes) |
| `package.json` | 8, 10–15 |
| `.env.local` | 4–9 |
| `vitest.config.ts` | 1–17 |
