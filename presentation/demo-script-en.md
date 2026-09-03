# Live Demo — Demo Script

**Duration:** 11 minutes (compressed critical path: 6 minutes)
**Required environment:** `pnpm install` (pre-installed), Node.js

> **Important:** The Service Worker is disabled in development mode (`NODE_ENV !== "production"` in `next.config.ts:8`). For the full demo with PWA/Offline, run `pnpm build && pnpm start` instead of `pnpm dev`.

---

## Time Split Summary

| # | Time | Action | Command |
|---|---|---|---|
| 1 | 0:00–1:00 | Set up environment | `pnpm dev` |
| 2 | 1:00–2:00 | Home page | Open `localhost:3000` |
| 3 | 2:00–3:30 | Navigate chapters + add bookmark | `chapter/[slug]` + bookmark button |
| 4 | 3:30–5:00 | Bookmark persistence | Reload the page |
| 5 | 5:00–6:00 | Theme toggle + reload | Moon/sun button |
| 6 | 6:00–8:00 | Search | `Ctrl+K` |
| 7 | 8:00–9:00 | Reading progress | Scroll + reload |
| 8 | 9:00–11:00 | PWA — offline mode (production build) | `pnpm build && pnpm start` |

**Compressed critical path (6 minutes):** Steps 1–5 + step 8 (skipping steps 6 and 7).

> Full sum: 1 + 1 + 1.5 + 1.5 + 1 + 2 + 1 + 2 = **11 minutes exactly**

---

## Step 1 — Set Up Environment (0:00–1:00)

**Action:** Start the development server.

**Command:**
```bash
pnpm dev
```

**What to say:**
> "This project is a static site — there is no database or backend server. All pages are pre-generated at build time. We'll start by running the development server."

**Evidence:** `package.json:6` — `"dev": "next dev --webpack"`.

---

## Step 2 — Home Page (1:00–2:00)

**Action:** Open the browser to `localhost:3000`. Show the grid containing 13 chapters.

**What to say:**
> "The home page displays 13 chapters in a grid. The data is read from the filesystem at build time via `getAllChapters()` in `lib/contentLoader.ts:18` — it's an `fs.readdirSync` call reading from the `content/chapters/` directory. There are no database queries here — everything happens at `next build`."

**Evidence:** `app/page.tsx:34-48` — the `{chapters.map(...)}` loop that creates the chapter cards.

---

## Step 3 — Navigate Chapters + Bookmark (2:00–3:30)

**Action:**
1. Click on a chapter (e.g. "المقدمة" / Introduction). Note the URL: `localhost:3000/chapter/intro/`.
2. Scroll down — "Previous" and "Next" buttons appear.
3. Click the bookmark button (star) at the top of the page.

**What to say:**
> "The URL ends with a trailing slash — `trailingSlash: true` in `next.config.ts:13`. This is the default SSG behavior: each page is a standalone folder containing `index.html`. Click 'Next' to go to the next chapter — chapter navigation relies on `getAllChapters()` in `lib/contentLoader.ts:49-61` which sorts chapters by number."

**Evidence:**
- `app/chapter/[slug]/page.tsx:41-45` — prev/next logic.
- `components/BookmarkButton.tsx:35-40` — `handleToggle` calls `toggleBookmark` then emits `bookmarks-updated`.

---

## Step 4 — Bookmark Persistence (3:30–5:00)

**Action:** Reload the page. The bookmark is still there.

**What to say:**
> "The bookmark is stored in `localStorage` under the key `basaar-bookmarks` — see `lib/bookmarks.ts:1`. The `readStorage()` function in `lib/bookmarks.ts:9-17` reads from `localStorage` directly with `try/catch` protection and a `typeof window === 'undefined'` check to avoid Server-Side Rendering errors. There are no network requests — everything is client-side."

**Evidence:** `lib/bookmarks.ts:1` — `STORAGE_KEY` constant, and `lib/bookmarks.ts:9-17` — `readStorage()` function.

**Note for the audience:** You can open Developer Tools (F12 → Application → Local Storage) to show the `basaar-bookmarks` key and its saved values.

---

## Step 5 — Theme Toggle + Reload (5:00–6:00)

**Action:**
1. Click the moon/sun button in the navigation bar (top right of the screen).
2. The screen switches to dark mode.
3. Reload the page — dark mode is still active.

**What to say:**
> "How do we prevent the theme toggle flash (hydration flash)? The secret is the `<script>` in `app/layout.tsx:39-41` — code that runs before the first paint. It reads `localStorage.getItem('theme')` and adds the `dark` class to the `<html>` element before React sees the page. This prevents the mismatch between server and client."

**Evidence:**
- `app/layout.tsx:39-41` — inline script.
- `components/Navbar.tsx:20-24` — `useSyncExternalStore` with `subscribeTheme` listening to `basaar-theme-change` events.
- `components/Navbar.tsx:27-31` — `toggleTheme` writes to `localStorage` and fires the event.

---

### Hydration Explanation — Wrong Pattern vs. Safe Pattern

> **This is a supplementary explanation for slides 24–27 in the presentation.**

**Wrong pattern — causes mismatch:**
```tsx
// ❌ Wrong: reading localStorage during render
function ThemeToggle() {
  const isDark = localStorage.getItem("theme") === "dark";
  return <div>{isDark ? "🌙" : "☀️"}</div>;
}
```
Problem: The server returns "☀️" (no `localStorage` on the server), while the client returns "🌙". A `Hydration mismatch` occurs.

**Safe pattern — using `suppressHydrationWarning` + `useSyncExternalStore`:**
1. **Inline script** (`app/layout.tsx:39-41`): Executes before React sees the page and adds `class="dark"` to `<html>` — the same thing the server does in `layout.tsx:37`.
2. **`suppressHydrationWarning`** (`app/layout.tsx:37`): Tells React to ignore the `class` difference because we know we are controlling it.
3. **`useSyncExternalStore`** (`components/Navbar.tsx:20-24`): Reads state from `document.documentElement.classList` safely while keeping tabs in sync.

**What to say:**
> "The safe pattern consists of three layers: the inline script that runs before painting, `suppressHydrationWarning` that tells React to ignore the difference, and `useSyncExternalStore` that reads the state safely. This is the recommended pattern in Next.js with React 19."

---

## Step 6 — Search (6:00–8:00)

**Action:**
1. Press `Ctrl+K` (or `Cmd+K` on Mac). The search dialog appears.
2. Type a word (e.g. "الله"). Results appear instantly.
3. Click a result to navigate to the chapter.

**What to say:**
> "Search works entirely on the client side — there is no server. FlexSearch loads the complete search index (`search-data.json`) when the dialog is first opened. The forward tokenize (`tokenize: 'forward'`) in `components/SearchDialog.tsx:52-60` allows prefix-based search. The search index is pre-built by `scripts/build-search-index.mjs` which runs automatically before the build via `prebuild` in `package.json:8`."

**Evidence:**
- `components/SearchDialog.tsx:44-73` — FlexSearch initialization and loading `search-data.json`.
- `components/SearchDialog.tsx:82-85` — search execution with `enrich: true` and `limit: 20`.

---

## Step 7 — Reading Progress (8:00–9:00)

**Action:**
1. Scroll down on a chapter page.
2. Notice the thin progress bar at the top of the page.
3. Reload the page — it returns to the same position.

**What to say:**
> "The progress bar reads the scroll percentage on every `requestAnimationFrame` — see `components/ReadingProgressBar.tsx:48-60`. The percentage is saved to `localStorage` via `saveChapterProgress()` in `lib/readingProgress.ts:27-36`. On page load, `getChapterProgress()` reads the saved position and returns it via `parent.scrollTop` in `ReadingProgressBar.tsx:42-46`. No server requests — everything is `localStorage`."

**Evidence:**
- `components/ReadingProgressBar.tsx:48-60` — scroll handler optimized with `requestAnimationFrame`.
- `lib/readingProgress.ts:27-36` — `saveChapterProgress()` writes to `localStorage`.

---

## Step 8 — PWA: Offline Mode (9:00–11:00)

> ⚠️ **Very important:** The Service Worker is disabled in development mode (`next.config.ts:8` — `disable: process.env.NODE_ENV !== "production"`). You must build the project and run it as a production build.

**Action:**
1. Stop the development server (`Ctrl+C`).
2. Run the build command (includes `prebuild` automatically):
   ```bash
   pnpm build
   ```
3. Run the production server:
   ```bash
   pnpm start
   ```
4. Open `localhost:3000`.
5. Open Developer Tools (F12) → Application tab → Service Workers. Confirm that `sw.js` is registered.
6. Navigate to a chapter page (e.g. `/chapter/intro/`).
7. In the Network tab, select "Offline" from the dropdown.
8. Try navigating — the page loads normally from the cache.

**What to say:**
> "Now in production mode: Serwist registers the Service Worker which pre-caches all static assets via `precacheEntries` in `sw.ts:6`. When offline mode is activated in DevTools, the `defaultCache` (`sw.ts:10`) handles navigation and resource requests. The first visit may show a loading screen, but after that cached pages work offline. We can note that `skipWaiting: true` and `clientsClaim: true` (`sw.ts:7-8`) activate the SW immediately without waiting for tabs to close."

**Evidence:**
- `sw.ts:6-8` — Serwist config with precacheEntries, skipWaiting, and clientsClaim.
- `next.config.ts:8` — `disable: process.env.NODE_ENV !== "production"`.

**Note:** If a page that was not previously cached is opened, an error page may appear. There is no `setCatchHandler` in `sw.ts` — consistent with the fact that we do not provide a custom offline fallback page.

---

## Fallback Plan — If Production Build Fails or Is Unavailable

**Situation:** If we cannot run `pnpm build && pnpm start` (e.g. environment unavailable or build fails):

1. Use steps 1–7 only via `pnpm dev`.
2. Explain step 8 verbally: "In production, Serwist pre-caches all static assets in the Service Worker. When offline, the SW activates and serves the cached files. See `sw.ts` for the configuration."
3. There is no database to verify against — the only environment variable is `NEXT_PUBLIC_BASE_URL` which is used only in `sitemap.xml` and does not affect the demo.

---

## What to Say and What to Avoid

### Say This:

| Statement | Reason |
|---|---|
| "This is a static site — there is no server running in the background." | True: `output: "export"` in `next.config.ts:12`. |
| "Search works entirely client-side. Data is loaded when the dialog opens." | True: `fetch("/search-data.json")` in `SearchDialog.tsx:48`. |
| "Navigation is fast because HTML pages are pre-built." | True: SSG generates static HTML files. |
| "Settings persist via localStorage — no server needed." | True: bookmarks, theme, and readingProgress all use `localStorage`. |

### Don't Say This:

| Statement | Alternative |
|---|---|
| ~~"Fast as lightning"~~ | No performance benchmarks exist. Use: "Navigation is fast because pages are pre-built". |
| ~~"Fully secure"~~ | No CSP or security audit exists. Use: "Static surface with security via `.htaccess` or Cloudflare". |
| ~~"Works offline perfectly"~~ | No fallback page exists if the cache fails. Use: "Works offline for previously cached pages". |
| ~~"Basaar — a smart tool"~~ | This is a digital book, a tool. Do not overstate the description. |

---

## Compressed Critical Path Summary (6 minutes)

1. **(0:30)** `pnpm dev` → `localhost:3000`
2. **(0:30)** Show home page — 13 chapters
3. **(0:45)** Open a chapter → prev/next → bookmark button
4. **(0:45)** Reload → bookmark is still present
5. **(0:45)** Toggle theme → reload → theme persists
6. **(0:15)** One sentence: "Search works entirely client-side via FlexSearch"
7. **(0:15)** One sentence: "Reading progress is saved in localStorage"
8. **(2:15)** Run `pnpm build && pnpm start` → show PWA in offline mode

> Sum: 30 + 30 + 45 + 45 + 45 + 15 + 15 + 135 = 360 seconds = **6:00 exactly**
