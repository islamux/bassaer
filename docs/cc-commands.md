# Command Center CLI Reference

All commands must be run from the **project root directory**. Do not run them from `/web`.

---

## Quick Reference

| Command | Description |
| :--- | :--- |
| `pnpm cc` | Launch interactive terminal dashboard |
| `pnpm cc:watch` | Start Command Center desktop dev server |
| `pnpm cc:update` | Sync the tracker with latest changes |
| `pnpm cc:log` | Show the project activity log |
| `pnpm web:dev` | Start Next.js dev server |
| `pnpm web:build` | Build Next.js for production |

---

## Core Commands

### `pnpm cc`
Launch the interactive terminal dashboard.
```
pnpm cc
```
Launches `cc-dash.py` — view Active Milestones, Backlog, and Swim Lane in the terminal.

### `pnpm cc:watch`
Start the Command Center desktop app in development watch mode.
```
pnpm cc:watch
```

### `pnpm cc:update`
Sync the tracker with latest changes.
```
pnpm cc:update
```

### `pnpm cc:log`
Show the project activity log.
```
pnpm cc:log
```

---

## Utility Commands

### `pnpm web:dev`
Start the Next.js development server for the main web application.
```
pnpm web:dev
```

### `pnpm web:build`
Build the main web application for production.
```
pnpm web:build
```

---

## Notes

- The `cc-dash.py` script automatically sets `PROJECT_ROOT` to the project root. Run from the root directory — **not** from `/web`.
- `pnpm web:dev` and `pnpm web:build` are Next.js commands aliased in the root `package.json` for convenience.
