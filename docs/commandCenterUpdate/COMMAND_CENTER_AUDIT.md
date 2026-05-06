# Command Center — Senior Architectural Audit

**Date:** May 2026
**Auditor:** Senior Systems Engineer
**Scope:** `command-center-mcp/`, `command-center-tui/`, `project-tracker.json`, `.mcp.json`

---

# 1. Executive Summary

## Overall Quality Score: 5.5 / 10

The Command Center is a functional prototype with an ambitious vision — an MCP-powered project tracker with a TUI dashboard and agent orchestration. The core data model is well-conceived and the task lifecycle state machine is sound. However, the implementation suffers from critical code duplication, zero runtime validation, fragile coupling between MCP tools and CLI, and a TUI that was originally designed for Python/Textual but shipped as Node.js/blessed with significant quality gaps.

### Main Strengths

1. **Sound data model.** The `TrackerState` schema with milestones, subtasks, agents, and activity logs is well-structured for project tracking at this scale.
2. **Dual interface (MCP + CLI).** Providing both MCP tool access and a shell CLI is genuinely useful for developer workflows.
3. **Task lifecycle state machine.** The `todo → in_progress → review → done` flow with `blocked` escape hatch and `reject → in_progress` loop is correct and well-documented in `workflow.md`.
4. **Auto-unblock cascade.** When a task is approved, dependents are automatically checked and unblocked. This is a real value-add.
5. **Backup system.** `backup.ts` with undo log and rotating backups shows operational awareness.
6. **File watcher in TUI.** Real-time sync via chokidar watching `project-tracker.json` is the right architecture.

### Main Weaknesses

1. **Massive code duplication.** CLI (`cli.ts`, 742 lines) and MCP tools (`tools.ts`, 979 lines) contain nearly identical business logic for every operation. A single change requires editing both files.
2. **Zero runtime validation.** The JSON file is `JSON.parse()`'d and used directly. No Zod, no schema validation, no migration safety net beyond a stub `migrateTracker`.
3. **Duplicate type definitions.** `tracker.ts` (MCP) and `types.ts` (TUI) define identical interfaces independently. Divergence is inevitable.
4. **No concurrency protection.** Multiple agents (or CLI + MCP simultaneously) can race on `writeTracker`. No file locking, no atomic writes, no conflict detection.
5. **TUI rendering issues.** Every view rebuilds from scratch on every render (destroy + recreate all blessed widgets). This causes flickering and loses scroll position and focus state.
6. **Blueprint-implementation mismatch.** The blueprint (`command-center-blueprint.md`) specifies Python/Textual/Pydantic/Watchdog. The actual implementation is Node.js/blessed/chokidar. The blueprint is now misleading documentation.
7. **Unsafe type assertions.** Pervasive `as string`, `as Subtask`, `as any` casts throughout the codebase with no validation of the actual values.

### Critical Risks

| Risk | Severity | Description |
|------|----------|-------------|
| Data corruption | **Critical** | Concurrent writes can interleave and corrupt the JSON file |
| Schema drift | **High** | No validation means corrupt/incomplete JSON silently passes through |
| Logic divergence | **High** | CLI and MCP tools will inevitably diverge, causing different behavior |
| TUI state loss | **Medium** | Full widget rebuild on every render loses user context |

### Scalability Assessment

- **Milestones:** The O(n*m) scan for `findTask` and `selectScheduleStatus` is fine for <100 milestones. Beyond that, an index map is needed.
- **Agent log:** Unbounded growth. Every action appends to `agent_log` in a single JSON file. At 1000+ entries, reads and writes slow down. Needs rotation or archival.
- **Agents:** The flat array with linear scans is fine for <20 agents. For multi-agent orchestration at scale, a proper agent registry with pub/sub is needed.

---

# 2. Architecture Review

## 2.1 MCP Server Architecture

```
index.ts (66 lines)    → MCP server entry, request routing
tools.ts (979 lines)   → 24 tool definitions + handlers (MONOLITH)
tracker.ts (314 lines) → Types + read/write + selectors
context.ts (127 lines) → Markdown formatters
cli.ts (742 lines)     → CLI with duplicate logic
backup.ts (69 lines)   → Backup + undo log
```

**Architecture smells:**

- **Monolithic `tools.ts`.** 979 lines containing 24 tool definitions, each with inline business logic. This is a God file. Each tool handler does its own read-validate-mutate-log-write cycle.
- **No service layer.** Business logic lives directly in tool handlers and CLI switch cases. There is no shared service between MCP and CLI — they duplicate everything.
- **No command registry.** Tools are defined as individual exports and collected into an array. There's no dynamic discovery, no command metadata, no help generation from a single source of truth.
- **Sync I/O everywhere.** All file operations are synchronous (`readFileSync`, `writeFileSync`). This blocks the Node.js event loop. For an MCP server that should handle concurrent requests, this is a problem.

**The tool handler pattern is repetitive:**

```typescript
// Every tool follows this exact pattern:
(args) => {
  const state = readTracker();                          // 1. Read
  const found = findTask(state, args.task_id as string); // 2. Find (unsafe cast)
  if (!found) return { text: '...', isError: true };     // 3. Validate (partial)
  // ... mutate state directly ...                       // 4. Mutate
  state.agent_log.push({ ... });                         // 5. Log
  touchAgent(state, ...);                                // 6. Touch agent
  writeTracker(state);                                   // 7. Write
  return `...`;                                          // 8. Return
}
```

This pattern appears 16+ times. It should be abstracted into a command executor with middleware.

## 2.2 TUI Architecture

```
index.ts               → Bootstrap blessed screen
dashboard.ts (67 lines)→ Layout + key bindings
store.ts (133 lines)   → State + file watcher
theme.ts (95 lines)    → Color definitions
config.ts (16 lines)   → Path resolution
types.ts (101 lines)   → Duplicate type definitions
views/
  swim-lane.ts (110)   → Timeline view
  task-board.ts (311)  → Kanban board (most complex view)
  agent-hub.ts (208)   → Agent monitoring
  calendar.ts (136)    → Week calendar
components/
  tab-bar.ts (33)      → Tab navigation
  status-bar.ts (42)   → Status footer
```

**Architecture smells:**

- **Full rebuild on every state change.** `renderDashboard()` detaches and recreates all widgets. This is the #1 performance problem. Professional TUIs use incremental updates.
- **Module-level mutable state.** `task-board.ts` uses module-level `let` variables (`activeColIndex`, `activeFilter`, `columnLists`, `detailModal`). These persist across rebuilds but can become stale.
- **No component lifecycle.** Blessed widgets are created and attached but there's no unmount/cleanup pattern. Event listeners from old widgets may leak.
- **Fragile parent lookup.** `destroyAndRefresh` and `refresh` find the view area by checking `c.options?.top === 1 && c.options?.bottom === 1` — a brittle heuristic that will break if layout changes.
- **No input sanitization in TUI writes.** The TUI directly mutates task state and writes back. The `scheduleWriteBack` with debounce is good, but the mutation bypasses all MCP validation.

## 2.3 Task System

The task lifecycle is well-designed:

```
TODO → IN_PROGRESS → REVIEW → DONE
                       ↓
                   IN_PROGRESS (reject)
Any → BLOCKED → TODO/IN_PROGRESS (unblock)
```

**Issues:**

- **`done` field is redundant.** `subtask.done` is a boolean mirror of `status === 'done'`. They can diverge. Progress calculation uses `done`, status checks use `status`. This is a consistency risk. Observed in `tracker.ts:165` (`filter(t => t.done)`) vs status checks.
- **`priority` is a string, not a union.** Should be `'P1' | 'P2' | 'P3' | 'P4'` but typed as `string`. Any value is accepted.
- **Task ID generation is fragile.** `generateTaskId` uses `existingSubtasks.length + 1`. If a task is deleted, IDs collide. Should use a counter or check for uniqueness.
- **No state transition guards.** `startTaskTool` doesn't check if the task is already `in_progress` or `done`. You can "start" a done task. The CLI `approve-task` checks for `review` status, but the MCP tool does too — inconsistently, `startTaskTool` has no such guard.
- **`STATUS_CYCLE` in TUI skips `blocked`.** The task board's `s` key cycles `todo → in_progress → review → done` but never to `blocked`. A task can only be blocked via `b` key. This is intentional but undocumented.

## 2.4 Agent System

The agent system is the thinnest part of the implementation:

- **No execution engine.** Agents are registered and logged, but there's no actual orchestration. The "Explorer", "Researcher", and "Post-Build Auditor" roles described in `workflow.md` are purely conceptual — there is no code that dispatches, monitors, or coordinates agents.
- **No permission enforcement.** Agents have `permissions: string[]` but nothing checks them. Any agent can perform any operation.
- **No agent isolation.** All agents share the same tracker state. One agent's mutation is immediately visible to all others.
- **`session_action_count` is misleading.** It's incremented on every `touchAgent` call but never resets. It's not a session counter — it's a lifetime counter.
- **No heartbeat/health check.** Agent "active" status is determined by a 30-minute window on `last_action_at`. There's no periodic heartbeat.

## 2.5 Storage Design

**`project-tracker.json` as single source of truth:**

- **No atomic writes.** `fs.writeFileSync` is not atomic. A crash mid-write corrupts the file. The backup system mitigates but doesn't prevent this.
- **No file locking.** Multiple processes (MCP server + CLI + TUI) can write simultaneously. Last writer wins, intermediate writes are lost.
- **Unbounded growth.** `agent_log` grows without limit. Every action appends an entry. At scale, the JSON file becomes unwieldy.
- **Full file rewrite on every write.** The entire state is serialized on every mutation. With 100+ tasks and 1000+ log entries, this becomes slow.

---

# 3. Critical Problems

## Critical

### C1. Concurrent Write Corruption
**Location:** `tracker.ts:175`, `store.ts:46-58`
**Description:** No file locking or atomic writes. MCP server, CLI commands, and TUI write-back can all write `project-tracker.json` simultaneously. `writeFileSync` overwrites the entire file. If two writes overlap, one is lost or the file is corrupted.
**Impact:** Data loss. The backup system provides recovery but not prevention.
**Fix:** Use `writeFileSync` to a temp file + `renameSync` for atomic replacement. Add a simple lock file with PID.

### C2. CLI and MCP Logic Divergence
**Location:** `cli.ts` (742 lines) vs `tools.ts` (979 lines)
**Description:** Every operation exists twice — once in the CLI switch statement and once as an MCP tool handler. They implement the same logic independently. For example, `approve-task` in the CLI (`cli.ts:207-256`) and `approveTaskTool` in tools (`tools.ts:277-328`) both implement approval logic but with subtle differences (the CLI version has its own inline unblock logic while the tool calls `autoUnblockDependents`).
**Impact:** Bugs fixed in one path remain in the other. Behavior differs between CLI and MCP for the same operation.
**Fix:** Extract all business logic into service functions in `tracker.ts`. Both CLI and MCP tools call the same service functions.

### C3. `migrateTracker` is a No-Op
**Location:** `tracker.ts:144-155`
**Description:** The migration function only handles `version 0 → 1` by setting `schemaVersion = 1`. No actual schema transformation occurs. The function accepts `any`, returns `TrackerState` via unsafe cast.
**Impact:** If the schema changes, there's no real migration path. Existing data could be invalid.
**Fix:** Implement proper migration steps. Add Zod validation after migration.

## High

### H1. Zero Runtime Validation
**Location:** All files that call `readTracker()`
**Description:** `JSON.parse(raw)` produces `any`, which is then used as `TrackerState` without validation. If the JSON file has missing fields, wrong types, or extra data, it silently propagates.
**Impact:** Type errors at runtime. Undefined access crashes. Silent data corruption.
**Fix:** Add Zod schemas for `TrackerState` and validate on every read.

### H2. Duplicate Type Definitions
**Location:** `command-center-mcp/src/tracker.ts:10-103` vs `command-center-tui/src/types.ts:1-101`
**Description:** Both packages define identical interfaces (`TrackerState`, `ProjectMeta`, `Milestone`, `Subtask`, `Agent`, `AgentLogEntry`, `Phase`). They are maintained independently.
**Impact:** Types will diverge. A field added to MCP won't appear in TUI until manually copied.
**Fix:** Create a shared package (e.g., `command-center-shared/`) or use a single source with TypeScript project references.

### H3. Unsafe Type Assertions
**Location:** Pervasive in `tools.ts` and `cli.ts`
**Description:** `args.task_id as string`, `args.priority as string`, `args.type as 'orchestrator' | 'sub-agent' | 'human' | 'external'`, `list as any`, etc. These bypass TypeScript's safety without runtime checks.
**Impact:** Invalid data passes through. `undefined` becomes `[object Undefined]` in strings.
**Fix:** Use Zod schemas for tool input validation. Remove all `as` casts.

### H4. TUI Full Rebuild on State Change
**Location:** `dashboard.ts:36-44`, `task-board.ts:306-310`
**Description:** `renderDashboard()` destroys and recreates all blessed widgets. Task board does `destroyAndRefresh` which detaches the parent and finds the view area via a fragile selector.
**Impact:** Flickering, lost focus, lost scroll position, lost selected task. Poor terminal UX.
**Fix:** Implement incremental updates. Only update changed elements. Track selected item indices across rebuilds.

### H5. `findProjectRoot` Divergence
**Location:** MCP `tracker.ts:105-121` vs TUI `config.ts:4-14`
**Description:** The MCP server walks up from `cwd` checking for `.env` and `project-tracker.json`. The TUI only checks `.env` in `process.cwd()`. They can resolve to different paths.
**Impact:** TUI and MCP could read different tracker files in edge cases.
**Fix:** Extract a shared `findProjectRoot` function.

## Medium

### M1. `done` and `status` Redundancy
**Location:** `Subtask` interface, `tracker.ts:165`, `task-board.ts:185-193`
**Description:** `done: boolean` and `status: 'todo' | ... | 'done'` represent the same thing. Progress calculation uses `t.done` but display uses `t.status`. They must be kept in sync manually.
**Impact:** Inconsistent state. A task could have `done: true` but `status: 'in_progress'`.
**Fix:** Remove `done`. Derive it from `status === 'done'`. Or make `done` a computed getter.

### M2. Unbounded Agent Log
**Location:** `tracker.ts:157-177`
**Description:** Every write appends to `agent_log` which is serialized into the JSON file. No rotation, no archival, no limit.
**Impact:** JSON file grows linearly. Eventually slow to read/write/parse.
**Fix:** Cap at configurable max (e.g., 500 entries). Archive older entries to a separate file.

### M3. `generateTaskId` Collision Risk
**Location:** `tracker.ts:303-306`
**Description:** Uses `existingSubtasks.length + 1`. If tasks are ever reordered or deleted, IDs collide.
**Impact:** Duplicate task IDs break `findTask` (returns first match).
**Fix:** Find the max existing numeric suffix and increment.

### M4. Module-Level Mutable State in TUI Views
**Location:** `task-board.ts:17-20`, `calendar.ts:7`
**Description:** `activeColIndex`, `activeFilter`, `columnLists`, `detailModal`, `viewWeekOffset` are module-level mutable variables. They persist across view rebuilds but can become stale if the tracker changes externally.
**Impact:** Stale references to destroyed widgets. Potential null access.
**Fix:** Move view state into the TUI `state` object or use a proper state container.

### M5. No Error Recovery in TUI
**Location:** `store.ts:28-35`
**Description:** If `readTrackerFromDisk` returns `null`, the TUI shows an error message but has no retry mechanism or fallback.
**Impact:** TUI becomes unusable if the JSON file is temporarily missing or corrupt.
**Fix:** Add retry with exponential backoff. Show partial state if possible.

### M6. Blueprint-Implementation Mismatch
**Location:** `docs/command-center-blueprint.md`
**Description:** The blueprint describes Python/Textual/Pydantic. The actual implementation is Node.js/blessed. The blueprint's TUI project structure (`command_center/`, `__main__.py`, `app.py`) doesn't exist.
**Impact:** Misleading documentation. New developers follow the blueprint and find completely different code.
**Fix:** Update the blueprint to match the actual implementation, or mark it as historical reference.

## Low

### L1. No `--help` Flag in CLI
**Location:** `cli.ts:14-42`
**Description:** Running `cc` with no args prints help, but `cc --help` and `cc start-task --help` don't work.
**Fix:** Add per-command help text.

### L2. `pino` Logging Only in MCP
**Location:** `tracker.ts:127-142`
**Description:** The TUI has no logging at all. The MCP server logs to `~/.command-center/logs/`.
**Fix:** Add at least error logging to the TUI.

### L3. Hardcoded 30-Minute Active Threshold
**Location:** `cli.ts:109`, `tools.ts:138`, `agent-hub.ts:64`
**Description:** Agent "active" status uses a hardcoded 30-minute window. This should be configurable.
**Fix:** Add to config.

### L4. No Version Command
**Description:** `cc --version` doesn't work.
**Fix:** Add version output from `package.json`.

### L5. `appendUndoEntry` is Unused
**Location:** `backup.ts:42-53`
**Description:** The function is imported in `tracker.ts:6` but never called. The undo system exists but is not wired up.
**Impact:** Dead code. False sense of undo capability.
**Fix:** Either wire up undo entries in `writeTracker` or remove the function.

---

# 4. Improvement Plan

## Phase 1 — Critical Stabilization (1-2 days)

**Goals:** Prevent data loss, eliminate logic divergence, add basic validation.

| Task | Complexity | Impact |
|------|-----------|--------|
| Extract shared service functions from `cli.ts` and `tools.ts` into `tracker.ts` | High | Eliminates #C2 |
| Add atomic file writes (temp file + rename) | Low | Eliminates #C1 |
| Add basic Zod validation on `readTracker()` | Medium | Eliminates #H1 |
| Remove unsafe `as` casts, use validated types | Medium | Eliminates #H3 |
| Wire up `appendUndoEntry` in `writeTracker` | Low | Fixes #L5 |

**Expected impact:** Data integrity guarantees. Single source of truth for business logic. Runtime type safety.

## Phase 2 — Architecture Cleanup (2-3 days)

**Goals:** Eliminate duplication, proper separation of concerns.

| Task | Complexity | Impact |
|------|-----------|--------|
| Create `command-center-shared/` package with shared types and Zod schemas | Medium | Eliminates #H2 |
| Restructure MCP tools to call service functions (thin handlers) | Medium | Reduces `tools.ts` from 979 to ~300 lines |
| Restructure CLI to call service functions (thin switch) | Medium | Reduces `cli.ts` from 742 to ~150 lines |
| Remove `done` field, derive from status | Low | Eliminates #M1 |
| Fix `generateTaskId` to be collision-safe | Low | Eliminates #M3 |
| Add state transition guards to all operations | Medium | Prevents invalid state transitions |
| Update or remove `command-center-blueprint.md` | Low | Fixes #M6 |

**Expected impact:** Maintainable codebase. Adding a new command means writing one service function + two thin wrappers (CLI + MCP). Changes propagate automatically.

## Phase 3 — Scalability Improvements (2-3 days)

**Goals:** Handle growth in data and usage.

| Task | Complexity | Impact |
|------|-----------|--------|
| Add agent log rotation (cap + archive) | Medium | Eliminates #M2 |
| Add file locking for concurrent access | Medium | Strengthens #C1 |
| Add task index map for O(1) lookups | Low | Performance |
| Add `--help` per command and `--version` | Low | Fixes #L1, #L4 |
| Unify `findProjectRoot` between MCP and TUI | Low | Fixes #H5 |
| Add proper migration framework | Medium | Strengthens #C3 |
| Add configuration file support (`~/.command-center/config.json`) | Medium | Configurable thresholds |

**Expected impact:** System handles 10x the current data volume without degradation. Better developer experience.

## Phase 4 — Advanced Agent System (3-5 days)

**Goals:** Real agent orchestration, not just logging.

| Task | Complexity | Impact |
|------|-----------|--------|
| Implement agent dispatch: `dispatch_agent(task_id, role, context)` | High | Enables multi-agent workflow |
| Add permission enforcement on operations | Medium | Security |
| Add agent heartbeat mechanism | Medium | Reliability |
| Implement agent result collection and validation | High | Quality assurance |
| Add retry/timeout logic for agent operations | Medium | Resilience |
| Add task dependency auto-blocking on creation | Medium | Automation |
| Implement `session_action_count` reset on new session | Low | Accuracy |

**Expected impact:** The Explorer → Researcher → Builder → Auditor pipeline from `workflow.md` becomes executable, not just documented.

## Phase 5 — Enterprise-Level DX (3-5 days)

**Goals:** Professional-grade developer experience.

| Task | Complexity | Impact |
|------|-----------|--------|
| TUI incremental rendering (no full rebuild) | High | Eliminates #H4 |
| TUI persistent state across rebuilds | Medium | Eliminates #M4 |
| TUI `--help` overlay | Low | Discoverability |
| Shell auto-completion for `cc` command | Medium | CLI UX |
| Add `cc undo` command using undo log | Medium | Safety net |
| Add `cc export` (JSON/CSV/Markdown) | Medium | Reporting |
| Add TUI logs panel (live agent activity) | Medium | Observability |
| Add TUI search/filter for tasks across milestones | Medium | Navigation |
| Add TUI resize handling | Low | Robustness |
| Add TUI `cc dashboard --port 0` for web fallback | High | Accessibility |

**Expected impact:** Command Center becomes a tool developers enjoy using, not just tolerate.

---

# 5. Refactor Recommendations

## 5.1 Proposed Folder Structure

```
command-center-mcp/
├── src/
│   ├── index.ts              # MCP server entry (unchanged)
│   ├── cli.ts                # CLI entry (thin wrapper)
│   ├── services/             # NEW: Business logic
│   │   ├── task.service.ts
│   │   ├── milestone.service.ts
│   │   ├── agent.service.ts
│   │   └── tracker.service.ts
│   ├── tools/                # RENAMED from tools.ts
│   │   ├── registry.ts       # Tool registration
│   │   ├── task.tools.ts     # Thin MCP wrappers
│   │   ├── milestone.tools.ts
│   │   ├── agent.tools.ts
│   │   └── read.tools.ts
│   └── storage/              # NEW: Storage abstraction
│       ├── tracker-file.ts
│       ├── backup.ts
│       └── lock.ts

command-center-shared/         # NEW: Shared package
├── src/
│   ├── schema.ts             # Zod schemas
│   ├── types.ts              # TypeScript interfaces
│   └── selectors.ts          # Pure functions (currentWeek, scheduleStatus, etc.)

command-center-tui/
├── src/
│   ├── index.ts
│   ├── dashboard.ts
│   ├── store.ts              # Uses shared types
│   ├── theme.ts
│   ├── views/
│   │   ├── swim-lane.ts
│   │   ├── task-board.ts
│   │   ├── agent-hub.ts
│   │   └── calendar.ts
│   └── components/
│       ├── tab-bar.ts
│       ├── status-bar.ts
│       └── detail-modal.ts   # Extracted from task-board.ts
```

## 5.2 Service Layer Pattern

Replace the current duplicated handler logic with shared service functions:

```typescript
// services/task.service.ts
export function startTask(
  state: TrackerState,
  taskId: string,
  agentId: string = 'orchestrator',
): ServiceResult {
  const found = findTask(state, taskId);
  if (!found) return { ok: false, error: `Task '${taskId}' not found` };

  if (found.subtask.status !== 'todo' && found.subtask.status !== 'blocked') {
    return { ok: false, error: `Task '${taskId}' is '${found.subtask.status}', cannot start` };
  }

  found.subtask.status = 'in_progress';
  found.subtask.last_run_id = 'run_' + Date.now();
  if (!found.subtask.assignee) found.subtask.assignee = agentId;

  if (!found.milestone.actual_start) {
    found.milestone.actual_start = todayDateString();
    if (found.milestone.planned_start) {
      found.milestone.drift_days = computeDrift(found.milestone.planned_start);
    }
  }

  appendLog(state, agentId, 'task_started', 'subtask', found.subtask.id, `Started task ${taskId}`, ['start']);
  touchAgent(state, agentId);
  writeTracker(state, 'start_task');

  return { ok: true, data: `Started ${found.subtask.id}` };
}
```

Then the MCP tool becomes:

```typescript
// tools/task.tools.ts
export const startTaskTool = makeTool(
  'start_task',
  'Start working on a task',
  startTaskSchema,
  (args) => {
    const result = startTask(readTracker(), args.task_id, args.agent_id);
    return result.ok ? result.data : { text: result.error, isError: true };
  }
);
```

And the CLI becomes:

```typescript
// cli.ts (excerpt)
case 'start-task': {
  const taskId = args[1];
  if (!taskId) error('Usage: start-task <task_id>');
  const agentId = getArg('--agent', 'orchestrator')!;
  const result = startTask(readTracker(), taskId, agentId);
  if (!result.ok) error(result.error);
  result = result.data;
  break;
}
```

**Result:** Business logic written once, used everywhere. Adding a new operation means:
1. Write one service function
2. Write one thin MCP wrapper
3. Add one CLI case that calls the service

## 5.3 Event Bus for Agent System

For Phase 4, an event-driven architecture enables multi-agent coordination:

```typescript
// services/event-bus.ts
type EventName = 'task_started' | 'task_completed' | 'task_blocked' | 'task_approved' | 'milestone_completed';
type EventHandler = (event: TrackerEvent) => void | Promise<void>;

export class EventBus {
  private handlers = new Map<EventName, EventHandler[]>();

  on(event: EventName, handler: EventHandler): void {
    const existing = this.handlers.get(event) ?? [];
    existing.push(handler);
    this.handlers.set(event, existing);
  }

  async emit(event: TrackerEvent): Promise<void> {
    const handlers = this.handlers.get(event.name) ?? [];
    for (const handler of handlers) {
      await handler(event);
    }
  }
}

// Usage: auto-unblock as event handler
bus.on('task_approved', async (event) => {
  autoUnblockDependents(state, event.taskId, event.milestoneId);
});
```

## 5.4 Schema Redesign with Zod

```typescript
// shared/src/schema.ts
import { z } from 'zod';

export const SubtaskStatusSchema = z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']);
export const PrioritySchema = z.enum(['P1', 'P2', 'P3', 'P4']);
export const ExecutionModeSchema = z.enum(['human', 'agent', 'pair']);
export const AgentTypeSchema = z.enum(['orchestrator', 'sub-agent', 'human', 'external']);
export const ScheduleStatusSchema = z.enum(['on_track', 'behind', 'ahead']);

export const SubtaskSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: SubtaskStatusSchema,
  assignee: z.string().nullable(),
  blocked_by: z.string().nullable(),
  blocked_reason: z.string().nullable(),
  completed_at: z.string().nullable(),
  completed_by: z.string().nullable(),
  priority: PrioritySchema,
  notes: z.string().nullable(),
  prompt: z.string().nullable(),
  context_files: z.array(z.string()),
  reference_docs: z.array(z.string()),
  acceptance_criteria: z.array(z.string()),
  constraints: z.array(z.string()),
  agent_target: z.string().nullable(),
  execution_mode: ExecutionModeSchema,
  depends_on: z.array(z.string()),
  last_run_id: z.string().nullable(),
  builder_prompt: z.string().nullable(),
});

// ... similar for Milestone, Agent, etc.

export const TrackerStateSchema = z.object({
  schemaVersion: z.number(),
  project: ProjectMetaSchema,
  milestones: z.array(MilestoneSchema),
  agents: z.array(AgentSchema),
  agent_log: z.array(AgentLogEntrySchema),
  schedule: z.object({ phases: z.array(PhaseSchema) }),
});

// Usage in readTracker:
export function readTracker(): TrackerState {
  const raw = fs.readFileSync(TRACKER_PATH, 'utf-8');
  const parsed = JSON.parse(raw);
  const migrated = migrateTracker(parsed);
  return TrackerStateSchema.parse(migrated); // Throws on invalid data
}
```

## 5.5 Atomic Write Pattern

```typescript
// storage/tracker-file.ts
export function writeTrackerAtomic(filePath: string, data: TrackerState): void {
  const tmpPath = filePath + '.tmp.' + process.pid;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));
  fs.renameSync(tmpPath, filePath); // Atomic on POSIX
}
```

---

# 6. TUI Improvements

## 6.1 Incremental Rendering

**Current:** Destroy all widgets, recreate all widgets.
**Target:** Update content of existing widgets.

```typescript
// Instead of destroying and recreating:
export function updateTaskBoard(
  container: blessed.Widgets.BoxElement,
  milestone: Milestone,
): void {
  const columns = COLUMNS;
  columns.forEach((col, i) => {
    const existingList = columnLists[i];
    if (!existingList) return;

    const tasks = milestone.subtasks.filter(t => t.status === col.id);
    existingList.setItems(tasks.map(t => formatTask(t, col)));

    // Update column label
    const columnBox = existingList.parent as blessed.Widgets.BoxElement;
    if (columnBox) {
      columnBox.setLabel(` ${col.label} (${tasks.length}) `);
    }
  });
}
```

This preserves focus, scroll position, and selected index.

## 6.2 Detail Modal as Shared Component

Extract `openDetailModal` from `task-board.ts` into `components/detail-modal.ts`. It's 80 lines of reusable UI code.

## 6.3 Live Logs Panel

Add a dedicated logs panel to the Agent Hub that streams agent activity in real-time:

```typescript
// views/agent-hub.ts addition
function renderLiveLog(parent: blessed.Widgets.BoxElement, log: AgentLogEntry[]): void {
  const logBox = blessed.log({
    parent,
    bottom: 0, left: 0, right: 0, height: 10,
    label: ' Live Activity ',
    scrollable: true,
    alwaysScroll: true,
    scrollbar: { ch: '█', track: { bg: 'black' } },
    style: { ... },
  });

  for (const entry of log.slice(-20)) {
    logBox.log(`${entry.agent_id}: ${entry.action} — ${entry.description}`);
  }
}
```

## 6.4 Keyboard Flow Improvements

| Key | Current | Proposed |
|-----|---------|----------|
| `j/k` | Nothing | Navigate within column lists |
| `J/K` | Nothing | Move task priority up/down |
| `x` | Nothing | Toggle task blocked state |
| `/` | Nothing | Search tasks across milestones |
| `?` | Nothing | Show keyboard help overlay |
| `g` | Nothing | Go to task by ID |
| `Enter` | Select (same as click) | Open detail modal |
| `Backspace` | Nothing | Go back to list from modal |

## 6.5 Navigation Model Improvement

Currently, milestone navigation uses `[` and `]` at the screen level, but these conflict with nothing because the task board captures `tab`. The proposed model:

- **Screen-level:** `1-4` switch tabs, `[` `]` navigate milestones, `r` refresh, `t` theme, `q` quit
- **View-level:** Each view handles its own keys. Views receive the active milestone index from the store.
- **Modal-level:** `Escape` closes, modal-specific keys operate on the modal content.

This is already roughly in place but needs formalization — currently the task board has `f1/f2/f3` filter keys that are not discoverable.

## 6.6 Async Rendering

The TUI currently blocks on file reads. For large tracker files, use async reads:

```typescript
export async function readTrackerFromDisk(): Promise<TrackerState | null> {
  try {
    const raw = await fs.promises.readFile(TRACKER_PATH, 'utf-8');
    return TrackerStateSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}
```

## 6.7 Terminal Resize Handling

Currently no resize handling exists. Blessed handles it implicitly, but the kanban column widths are calculated once on creation. After resize, columns can overlap or leave gaps.

**Fix:** Listen for `resize` event and recalculate column widths.

---

# 7. Production Readiness Assessment

## What is Production Ready

| Component | Status | Notes |
|-----------|--------|-------|
| MCP Server transport | **Ready** | Stdio transport with MCP SDK works reliably |
| CLI basic commands | **Ready** | All 20+ commands work for single-user scenarios |
| Task lifecycle | **Ready** | State machine is correct and well-documented |
| Context builders | **Ready** | Markdown output for agent context is well-formatted |
| Backup system | **Ready** | Rotating backups with max retention |
| TUI basic rendering | **Mostly ready** | All 4 views render correctly for small datasets |
| File watcher | **Ready** | Chokidar with debounce works well |

## What is Risky

| Component | Risk | Mitigation |
|-----------|------|------------|
| Concurrent writes | Data corruption | Phase 1: Atomic writes |
| No validation | Silent data corruption | Phase 1: Zod schemas |
| CLI/MCP divergence | Behavioral inconsistency | Phase 2: Service layer |
| TUI full rebuilds | Poor UX at scale | Phase 5: Incremental render |
| Unbounded log | Performance degradation | Phase 3: Log rotation |

## What Must Be Redesigned

| Component | Reason |
|-----------|--------|
| `tools.ts` monolith | Must be decomposed into service + thin tools |
| `cli.ts` monolith | Must become a thin wrapper over service functions |
| TUI view state management | Module-level mutable state must be centralized |
| Agent system | Currently conceptual only; needs execution engine |

---

*End of audit. Recommended first action: Phase 1 critical stabilization.*
