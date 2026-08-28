# Upgrade: Next.js / React to v16.2.4

## Current State

| Package | Current | Target |
|---------|---------|--------|
| `next` | `15.1.7` | `16.2.4` |
| `react` / `react-dom` | `19.0.0` | `19.2.0` |
| `@types/react` / `@types/react-dom` | `19.0.0` | Match react 19.x |
| `eslint-config-next` | `15.1.7` | `16.2.4` |
| `@types/node` | `^20` | `^22` |
| `sharp` | — | `^0.34.5` |

## Security Context

May 2026 coordinated security release. Next.js 16.2.4 includes all patches.

## Breaking Changes (15 → 16)

| Change | Impact | Action |
|--------|--------|--------|
| `middleware.ts` → `proxy.ts` | HIGH — file rename, import types from `next/proxy`, export name change | Rename file, update imports, rename export |
| `next lint` removed | MEDIUM — script breaks | Change script to `eslint .`, create flat config |
| Turbopack default | MEDIUM — verify PostCSS, `fs`, `next/image` | Test build; fallback: `next build --webpack` |
| Async APIs enforced | LOW — already `await params`, `await cookies()` | Verify no sync access |
| `next/image` defaults | LOW — home page only | Verify images render |
| `sharp@0.34.5` required | MEDIUM — add dependency | Add to package.json |
| Node.js 20.9+ | ✅ v22.17.1 | No action |

## Risk Assessment

### HIGH

| File | Issue |
|------|-------|
| `web/middleware.ts` → `web/proxy.ts` | Must migrate to `next/proxy` types |
| `web/app/auth/callback/route.ts` | Cookie bug: `setAll()` doesn't propagate cookies to redirect response |

### MEDIUM

| File | Issue | Action |
|------|-------|--------|
| `web/lib/contentLoader.ts` | `fs` usage with Turbopack | Verify build |
| `web/package.json` | `lint` script references removed `next lint` | Change to `eslint .` |
| `web/` — ESLint config | No config file exists | Create `eslint.config.mjs` |
| `web/tsconfig.json` | `target: "ES2017"` outdated | Update to `ES2022` |

### LOW

| File | Issue |
|------|-------|
| `web/app/page.tsx` | `next/image` default changes (home page only) |
| `web/lib/contentLoader.ts` | Sync `getAllChapters()` — fine, no change needed |

## Execution Order

### Subtask ng16_001: Set Vercel rootDirectory
- `vercel api PATCH /v1/projects/... -F rootDirectory=web`
- NOT via vercel.json (property not supported)

### Subtask ng16_002: Update package.json
- next 15.1.7 → 16.2.4
- react/react-dom 19.0.0 → 19.2.0
- @types/react, @types/react-dom match
- eslint-config-next 15.1.7 → 16.2.4
- @types/node ^20 → ^22
- Add sharp ^0.34.5
- lint script: next lint → eslint .

### Subtask ng16_003: Migrate middleware → proxy
- Rename middleware.ts → proxy.ts
- Import from `next/proxy` (not `next/server`)
- Types: NextRequest → ProxyRequest, NextResponse → ProxyResponse
- Export: middleware → proxy

### Subtask ng16_004: Create ESLint flat config
- Create eslint.config.mjs
- Use eslint-config-next with FlatCompat

### Subtask ng16_005: Update tsconfig.json
- target: ES2017 → ES2022

### Subtask ng16_006: Fix auth callback cookie bug
- Apply cookies from setAll() to NextResponse.redirect()

### Subtask ng16_007: Clean up
- Remove web/.vercel/ (duplicate)

### Subtask ng16_008: Install + Build
- pnpm install
- pnpm build (verify 18/18 pages)

### Subtask ng16_009: Test dev mode
- All 18 pages render
- Chapter [slug] pages resolve
- Auth callback flow works
- Search functionality works
- Bookmarks persist
- Reading progress tracking works
- Sidebar/navigation renders correctly

## Verification Criteria

- [ ] pnpm dev starts without errors
- [ ] pnpm build passes 18/18 pages
- [ ] No TypeScript errors
- [ ] Auth login flow completes (magic link)
- [ ] Bookmark add/remove works
- [ ] Search dialog opens and returns results
- [ ] Reading progress bar tracks scroll
- [ ] All chapter pages render H1 + content + images

## Branch

```
chore/upgrade-nextjs
```

## Status

The upgrade is complete. The shipped version is `next@16.2.10` (the "Target" of `16.2.4` in the Current State table above was the plan's interim target; the dependency landed on `16.2.10`). React is `19.2.7`, `eslint-config-next` `16.2.10`.

The content above is a historical record of the 15 → 16 upgrade plan and its execution order, written at upgrade time. Shortly after, the auth/server-auth layer was removed in the static-export migration (commit `5f0ced6`): the `middleware`→`proxy` migration, the auth callback, the SSR cookie handling, and the associated dependency no longer exist in the current tree, and the app now ships as a purely static export (`output: "export"`) on Hostinger shared hosting. Any references to middleware, route-handler cookie flow, or SSR-session security above describe that abandoned architecture and are **historical notes, not the current state**.
