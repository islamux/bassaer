# Upgrade: Next.js / React to Latest Stable

## Current State

| Package | Version | Target |
|---------|---------|--------|
| `next` | `15.1.7` | `15.5.18` (latest 15.x with May 2026 security patches) |
| `react` / `react-dom` | `19.0.0` | `19.0.6` (CVE-2026-23870 fix) |
| `@types/react` | `19.0.0` | Match react |
| `@types/react-dom` | `19.0.0` | Match react-dom |
| `eslint-config-next` | `15.1.7` | `15.5.18` |
| `@supabase/ssr` | `^0.10.3` | Pin to `0.10.2` (latest published) |

## Security Context

May 7, 2026 coordinated security release (13 advisories):
- **Next.js** `<=15.5.17` affected → upgrade to `15.5.18`
- **React** `react-server-dom-*` `<=19.0.5` affected → upgrade to `19.0.6`

CVE-2026-23870: DoS in React Server Components.

## Target: `next@15.5.18` (within 15.x, minimal breaking changes)

### Breaking changes across 15.1 → 15.5

| Version | Change | Impact |
|---------|--------|--------|
| 15.2 | Async metadata streams (doesn't block paint) | Verify `generateMetadata` still works |
| 15.2 | i18n config deprecation warning | Not used, no action |
| 15.3 | Turbopack config moved from `experimental.turbo` → top-level `turbopack` | Not used, no action |
| 15.3 | `useLinkStatus` hook for loading states | Optional enhancement |
| 15.4 | Viewport/metadata API separation | Check if `generateMetadata` affected |
| 15.5 | Security patch | Pin and verify |

## Risk Assessment

### HIGH (will break if not fixed)

| File | Issue |
|------|-------|
| `web/app/auth/callback/route.ts` lines 15-18 | `setAll()` cookies callback writes to `request.cookies` only, NOT to `NextResponse.redirect()`. Auth session cookies likely lost during OAuth callback. Fix: apply cookies to both request and response. |

### MEDIUM (needs attention)

| File | Issue | Action |
|------|-------|--------|
| `web/middleware.ts` | Mutable `supabaseResponse` reassignment pattern | Verify after upgrade |
| `web/app/chapter/[slug]/page.tsx` | `params: Promise<{slug: string}>` + `await params` | Verify this API is stable in 15.5.x |
| `web/lib/contentLoader.ts` | `fs` module usage in Server Components | May need `serverExternalPackages` in `next.config.ts` |
| `web/tsconfig.json` | `target: "ES2017"` outdated | Update to `ES2020` |
| `web/next.config.ts` | Empty config | Add `serverExternalPackages` for future-proofing |

### LOW (minor)

| File | Issue |
|------|-------|
| `web/app/layout.tsx` | Sync `getAllChapters()` call may need `await` if layout becomes async |
| `web/lib/supabase/server.ts` | `await cookies()` is correct for 15+ but verify API |
| `web/lib/bookmarks.ts` | Dead code (`isLoggedIn()` exported but never called) |
| `web/components/Navbar.tsx` | Direct DOM dark mode toggling (not using `next-themes`) |

## Step-by-Step Execution Order

### Subtask 1: Fix Vercel "No Next.js version detected"
- Add `vercel.json` at monorepo root with `"rootDirectory": "web"`
- This tells Vercel to look inside `web/` for the Next.js app

### Subtask 2: Update `web/package.json` dependencies
- `next`: `15.1.7` → `15.5.18`
- `react`: `19.0.0` → `19.0.6`
- `react-dom`: `19.0.0` → `19.0.6`
- `@types/react`: `19.0.0` → match
- `@types/react-dom`: `19.0.0` → match
- `eslint-config-next`: `15.1.7` → `15.5.18`
- `@supabase/ssr`: `^0.10.3` → `^0.10.2`

### Subtask 3: Fix auth callback cookie propagation bug
- File: `web/app/auth/callback/route.ts`
- Apply cookies from `setAll()` to the `NextResponse.redirect()` object

### Subtask 4: Update `web/tsconfig.json`
- `"target": "ES2017"` → `"target": "ES2020"`

### Subtask 5: Update `web/next.config.ts`
- Add `serverExternalPackages` config for `fs` usage

### Subtask 6: Install dependencies and build
- Run `pnpm install`
- Run `pnpm build`
- Verify 18/18 pages

### Subtask 7: Test dev mode
- All 18 pages render (SSG + SSR)
- Chapter `[slug]` pages resolve correctly
- Auth callback flow works (magic link sign-in)
- Search functionality works
- Bookmarks persist
- Reading progress tracking works
- Sidebar/navigation renders correctly

## Verification Criteria

- [ ] `pnpm dev` starts without errors
- [ ] `pnpm build` passes 18/18 pages
- [ ] No TypeScript errors after upgrade
- [ ] Auth login flow completes (magic link)
- [ ] Bookmark add/remove works
- [ ] Search dialog opens and returns results
- [ ] Reading progress bar tracks scroll
- [ ] All chapter pages render H1 + content + images

## Branch

```
chore/upgrade-nextjs
```
