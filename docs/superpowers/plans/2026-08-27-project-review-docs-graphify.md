# Project Review + Docs Refresh + Graphify Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit Bassaer for clean code/best practices, fix major issues, bring all docs in line with the current static-export architecture (post-auth-removal), and create the graphify structural index.

**Architecture:** Review-driven workflow on a single branch: build the code index first, establish quality-gate baselines, review -> fix majors, then docs refresh verified against source, final verification and PR.

**Tech Stack:** Next.js 16.2.10 / React 19 (static export), graphify-ts CLI, eslint 9, vitest, playwright

**Spec:** No external spec. Decisions recorded in this plan per the review: fix blocker/major findings only; delete `docs/supabase-setup.md`; rewrite stale interview Q&As to current arch; gitignore `graphify-out/`.

## Global Constraints

- Branch: `audit/project-review-docs-graphify` (never work on `main`)
- Gates: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` must pass before any commit is "done"
- GitHub Flow: commit -> push -> PR -> merge in UI -> **keep branch** (per AGENTS.md)
- Docs: every claim (versions, paths, commands) verified against actual source before writing
- Auth/Supabase was removed (commit `5f0ced6`, static export for Hostinger). No Supabase references may be re-introduced in code or docs.
- Do NOT add comments to code unless the plan/edit requires it.

---

### Task 1: Branch + plan persistence

- [ ] Create branch `audit/project-review-docs-graphify` (always from an up-to-date `main`)
- [ ] Save this plan to `docs/superpowers/plans/2026-08-27-project-review-docs-graphify.md`
- [ ] Commit the plan file

**Verification:** `git status` shows only the plan file; `git log --oneline -1` shows the commit.

### Task 2: Graphify index

**Files:**
- Create: `graphify-out/graph.json` (generated, untracked)
- Modify: `.gitignore` (add `graphify-out/` under "Tool artifacts")

**Purpose:** Build the structural AST index that subsequent review work queries to locate symbols before grepping.

- [ ] Run `graphify build .` from repo root
- [ ] Confirm output: "Indexed {files} files, {nodes} symbols, {edges} relationships" and `graphify-out/graph.json` exists
- [ ] Add `graphify-out/` to the "Tool artifacts" section of `.gitignore`
- [ ] Commit the `.gitignore` change

**Verification:** `graphify query graphify-out/graph.json bookmarks` returns the `lib/bookmarks.ts` symbols.

### Task 3: Quality-gate baseline

**Files:** none (read-only commands)

- [ ] `pnpm lint` — record pass/fail
- [ ] `pnpm typecheck` — record pass/fail
- [ ] `pnpm test` — record pass/fail and test count
- [ ] `pnpm build` — record pass/fail (verifies static export to `out/`; `prebuild` runs the search-index script)
- [ ] Append results to `docs/superpowers/plans/2026-08-27-review-findings.md` as the baseline table

**Verification:** baseline table captures every gate result. No commits.

### Task 4: Clean-code review -> findings

**Files:**
- Create: `docs/superpowers/plans/2026-08-27-review-findings.md` (findings report — no code changes yet)

**Review scope:** `app/` (4 tsx/ts), `components/` (11 tsx), `lib/` (4 ts + `__tests__/`), `scripts/build-search-index.mjs`, `sw.ts`, `next.config.ts`, `eslint.config.mjs`, `tsconfig.json`, `package.json`

**Method:** Use the graphify index FIRST (`graphify query graphify-out/graph.json <symbol>`) to map symbols and connections before reading files. Then read every file in scope.

**Review lenses (severity-ranked, blocker/major/minor/note):**
1. Dead code and stale references from the auth removal (unused exports, leftover props/interfaces, unused deps in `package.json`, e.g. is `sharp` still needed under static export? is `@serwist/next` wired correctly?)
2. `any` types / implicit any / unsafe casts in `lib/` and `components/`
3. Error handling: `lib/contentLoader.ts`, `lib/search.ts`, `scripts/build-search-index.mjs` (fail-open vs throw, missing try/catch, silent catch-alls)
4. RTL/accessibility in components (`components/`): missing `lang`/`dir`, non-semantic interactive elements, contrast, keyboard handling
5. PWA correctness under static export: `sw.ts`, `next.config.ts` `withSerwistInit`, manifest
6. Naming and pattern consistency across `lib/` and `components/`
7. Test coverage gaps in majors (`lib/__tests__/` + `e2e/`)

**Output contract:** findings document with a severity-ranked table: `severity | file:line | finding | suggested fix`. **Do not fix anything in this task.**

**Verification:** findings file exists with at least the baseline table (Task 3) and severity-ranked findings. Reviewable for accuracy by controller and final reviewer.

### Task 5: Fix blocker/major findings

**Files:** per findings (from Task 4) — modified source files only

- [ ] Fix findings in ordered batches (most severe first; one logical fix per commit)
- [ ] After each batch: `pnpm test:static` (tsc + eslint) and `pnpm test` must pass
- [ ] Update the findings doc: mark fixed findings as `[fixed]` (keep the record)
- [ ] Leave minors unfixed — they stay in the findings doc
- [ ] Rerun `pnpm build` once after all fixes before marking done

**Verification:** all Task 4 blocker/major findings marked `[fixed]`; gates green.

### Task 6: Docs refresh

**Files:**
- Modify: `README.md`, `docs/README.md`, `docs/upgrade-nextjs.md`, `docs/SENIOR_INTERVIEW_QUESTIONS.md`, `AGENTS.md`
- Delete: `docs/supabase-setup.md`

**Rules:** EVERY claim verified against actual source (package.json versions, real file paths, real behavior). No Supabase references survive in docs. Do not add emojis. Do not invent content.

- [ ] `README.md`: badge Next.js 15 -> 16; remove Supabase badge and all Supabase/auth feature bullets (bookmarks are localStorage-only now); describe static export for Hostinger; fix project-structure entries (`lib/` no longer holds Supabase clients, `scripts/` is Node not Python); remove the `docs/supabase-setup.md` pointer; mark bookmarks as localStorage-persisted
- [ ] `docs/README.md`: add `SENIOR_INTERVIEW_QUESTIONS.md` row; remove `supabase-setup.md` row
- [ ] Delete `docs/supabase-setup.md`; verify no inbound links remain: `rg -l "supabase-setup" --glob '!node_modules' --glob '!.next' --glob '!out'` must return nothing
- [ ] `docs/upgrade-nextjs.md`: append a short "Status" section noting the upgrade completed at 16.2.10 and the doc reflects the plan, not the shipped state (do NOT rewrite history); scan for any "current state" table claims and fix only if they assert shipped state wrongly
- [ ] `docs/SENIOR_INTERVIEW_QUESTIONS.md`: rewrite the Supabase/auth Q&As to match the current static-export architecture (no Supabase, no three clients, no middleware, no `auth-context.tsx`, no `app/auth/callback`): bookmarks are localStorage-only; PWA via Serwist on static export; every cited `file:line` rerified against the current tree; Q3/Q4/Q5 and any auth rounds replaced with current-architecture equivalents (keep total question count and format)
- [ ] `AGENTS.md`: add a "Verification" section: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (note `pnpm test:static` shorthand)
- [ ] Commit docs as one commit

**Verification:** `rg -i "supabase" README.md docs/` (excluding `superpowers/` history dirs) returns nothing; every `file:line` referenced in the interview doc exists; gates still green.

### Task 7: Final verification + PR

- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` all green
- [ ] `graphify build .` (refresh if Task 5 changed code); confirm `graphify-out/` still gitignored
- [ ] Self-review full diff against `main` (`git diff main`)
- [ ] Push branch, create PR via `gh`, report the URL in the final message
- [ ] Do **not** delete the branch after merge (AGENTS.md)