# Basaar Agent Guide

## 🌿 GitHub Flow

1. **Add** — `git add <files>`
2. **Commit** — `git commit -m "<descriptive message>"`
3. **Push** — `git push -u origin <branch>`
4. **PR** — create pull request via GitHub CLI or web
5. **Accept PR** — merge to `main` via GitHub UI
6. **Keep branch** — do **not** delete the remote branch after merging
7. **Update local main** — `git checkout main && git pull origin main`

## ✅ Verification

Quality gates to run before claiming any task complete:

- `pnpm lint` — ESLint
- `pnpm typecheck` — TypeScript (`tsc --noEmit`)
- `pnpm test` — Vitest unit tests
- `pnpm build` — production static export (runs `prebuild` + `next build`)

> **Shorthand:** `pnpm test:static` runs lint + typecheck together.
