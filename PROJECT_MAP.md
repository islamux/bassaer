# Basaar Command Center — PROJECT MAP

**Generated:** 2026-05-07  
**Scope:** `command-center-mcp/`, `command-center-tui/`, `command-center-shared/`  
**Working Directory:** `/media/islamux/Variety/JavaScriptProjects/bassaer/`

---

## [TECH_STACK]

### Root (`/media/islamux/Variety/JavaScriptProjects/bassaer/package.json`)
| Field | Value |
|-------|-------|
| name | `bassaer` |
| version | `1.0.0` |
| private | `true` |
| Scripts | `cc`, `cc:watch`, `cc:update`, `cc:log`, `cc:mcp`, `ccui` |

### command-center-mcp (`/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/package.json`)
| Field | Value |
|-------|-------|
| name | `command-center-mcp` |
| version | `1.0.0` |
| type | `module` |
| main | `dist/index.js` |
| bin | `command-center` → `dist/cli.js` |
| **Dependencies** | |
| `@modelcontextprotocol/sdk` | `^1.12.1` |
| `zod` | `^4.4.3` |
| **Dev Dependencies** | |
| `@types/node` | `^22.0.0` |
| `typescript` | `^5.7.0` |

**TypeScript Config:** `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/tsconfig.json`
- target: `ES2022`, module: `ES2022`, moduleResolution: `bundler`
- strict: `true`, declaration: `true`, sourceMap: `true`

---

### command-center-tui (`/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/package.json`)
| Field | Value |
|-------|-------|
| name | `command-center-tui` |
| version | `1.0.0` |
| type | `module` |
| main | `dist/index.js` |
| bin | `command-center-tui` → `dist/index.js` |
| **Dependencies** | |
| `blessed` | `^0.1.81` |
| `chokidar` | `^4.0.0` |
| **Dev Dependencies** | |
| `@types/blessed` | `^0.1.25` |
| `@types/node` | `^22.0.0` |
| `typescript` | `^5.7.0` |

**TypeScript Config:** `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/tsconfig.json`
- target: `ES2022`, module: `ES2022`, moduleResolution: `bundler`
- strict: `true`, declaration: `true`, sourceMap: `true`

---

### command-center-shared (`/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-shared/package.json`)
| Field | Value |
|-------|-------|
| name | `command-center-shared` |
| version | `1.0.0` |
| type | `module` |
| main | `dist/index.js` |
| types | `dist/index.d.ts` |
| **Dependencies** | |
| `zod` | `^4.4.3` |
| **Dev Dependencies** | |
| `@types/node` | `^22.0.0` |
| `typescript` | `^5.7.0` |

**TypeScript Config:** `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-shared/tsconfig.json`
- target: `ES2022`, module: `NodeNext`, moduleResolution: `NodeNext`
- strict: `true`, declaration: `true`, declarationMap: `true`, sourceMap: `true`

---

## [SYSTEM_FLOW]

### 1. project-tracker.json Read/Write Flow

```
Source File: /media/islamux/Variety/JavaScriptProjects/bassaer/project-tracker.json

READ PATH:
  command-center-mcp/src/storage/tracker-file.ts:readRaw()
    → fs.readFileSync(TRACKER_PATH, 'utf-8')
    → JSON.parse(raw)
    → TrackerStateSchema.parse(parsed)  [Zod validation]

  command-center-tui/src/store.ts:loadFromDisk()
    → fs.readFileSync(this._trackerPath, 'utf-8')
    → JSON.parse(raw) as TrackerState  [NO validation — unsafe cast]

WRITE PATH (MCP):
  command-center-mcp/src/services/tracker.service.ts:writeTracker()
    → withLock(() => {
        createBackup(operation)
        compute overall_progress + schedule_status
        writeAtomic(JSON.stringify(state, null, 2))
      })
    → tracker-file.ts:writeAtomic()
        → fs.writeFileSync(tmpPath, data)
        → fs.renameSync(tmpPath, TRACKER_PATH)  [atomic on POSIX]

WRITE PATH (TUI):
  Direct mutation of state in memory, no explicit write function in current TUI code.
  TUI reads only; writes happen exclusively through MCP server or CLI.
```

**Note:** `PROJECT_ROOT` is set via environment variable, read by:
- MCP: `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/storage/tracker-file.ts` line 5
- TUI: `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/config.ts:findProjectRoot()` walks up from `cwd` looking for `project-tracker.json`

---

### 2. MCP Tools Flow (Request → Handler → Response)

```
ENTRY POINT:
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/index.ts
    → Server setup with @modelcontextprotocol/sdk
    → ListToolsRequestSchema → getToolDefinitions() 
    → CallToolRequestSchema → handleTool(name, args)

TOOL HANDLER:
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/tools.ts
    → handleTool(name, args)
        → switch(name):
            READ TOOLS: readTracker() → build context/summary/status → return ok(text)
            WRITE TOOLS: readTracker() → call service function → writeTracker() → return ok/err

SERVICE LAYER (business logic):
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/tracker.service.ts
    → readTracker(), writeTracker(), findTask(), touchAgent(), pushLog(), pushHistory()

  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/task.service.ts
    → startTask(), completeTask(), approveTask(), rejectTask(), resetTask(),
       blockTask(), unblockTask(), updateTask(), logAction(), enrichTask()

  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/milestone.service.ts
    → addMilestoneNote(), setMilestoneDates(), updateDrift(), createMilestone(),
       addMilestoneTask(), moveMilestoneToCompleted()

  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/agent.service.ts
    → registerAgent()

CONTEXT BUILDERS (Markdown formatters):
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/context.ts
    → buildTaskContext(), buildTaskSummary(), buildProjectStatus(), buildMilestoneOverview()
```

**Tool Definitions (24 tools):**

| Category | Tools |
|----------|-------|
| Read | `get_task_context`, `get_task_summary`, `get_project_status`, `get_milestone_overview`, `list_tasks`, `get_task_history`, `list_agents`, `get_activity_feed` |
| Task Lifecycle | `start_task`, `complete_task`, `approve_task`, `reject_task`, `reset_task`, `block_task`, `unblock_task` |
| Task Update | `update_task`, `log_action`, `enrich_task` |
| Milestone | `add_milestone_note`, `set_milestone_dates`, `update_drift`, `create_milestone`, `add_milestone_task` |
| Agent | `register_agent` |

---

### 3. TUI Rendering Flow (File Watch → State Update → Render)

```
ENTRY POINT:
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/index.ts
    → Store instantiation (loads state from disk)
    → fs.watchFile(trackerPath, { interval: 1000 }, callback)
        → store.loadFromDisk()
        → renderAll()

STATE STORE:
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/store.ts
    → Store extends EventEmitter
    → loadFromDisk(): read file → JSON.parse → emit('change')
    → _state: TrackerState | null

RENDER CYCLE:
  renderAll() in index.ts:
    1. Destroy current view (if exists): screen.remove(currentView), currentView.destroy()
    2. Destroy tabBar, statusBar
    3. Recreate:
       tabBar = createTabBar(screen, activeTab, callback)
       statusBar = createStatusBar(screen, store.state)
       switch(activeTab):
         case 0: currentView = createSwimLane(screen, state, milestoneIdx)
         case 1: currentView = createTaskBoard(screen, state, milestoneIdx)
         case 2: currentView = createAgentHub(screen, state)
         case 3: currentView = createCalendar(screen, state)
    4. screen.render()

VIEWS:
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/views/swim-lane.ts
    → Renders: Active milestones (with progress bars), Backlog, Completed (last 5)
    → Navigation: [ / ] keys cycle milestones

  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/views/task-board.ts
    → Renders: Kanban columns (TODO, IN PROGRESS, REVIEW, DONE, BLOCKED)
    → Navigation: [ / ] keys cycle milestones, s key cycles status filter

  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/views/agent-hub.ts
    → Renders: Registered agents list, Recent activity from history_log

  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/views/calendar.ts
    → Renders: Project timeline (week markers), Completed milestones by date, Activity by date

COMPONENTS:
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/components/tab-bar.ts
    → Renders tab navigation: Swim Lane [1], Task Board [2], Agent Hub [3], Calendar [4]

  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/components/status-bar.ts
    → Renders: Week, Schedule Status, Progress, Milestone counts, Current focus

THEME:
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/theme.ts
    → Dark theme: bg=#1a1a2e, fg=#e0e0e0, accent=#e2b714
    → Light theme: bg=#fafafa, fg=#1a1a2e, accent=#b8860b
    → statusColor(), statusIcon(), priorityBadge() helpers
```

**Keybinding (global in index.ts):**
- `q` / `C-c`: Quit
- `1-4`: Switch tabs
- `[` / `]`: Cycle milestones
- `r`: Force reload from disk
- `t`: Toggle dark/light theme

---

### 4. CLI Command Flow

```
ENTRY POINT:
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/cli.ts
    → parseArgs(process.argv)
        → command = args[0].replace(/-/g, '_')
        → positional = args[1...]
        → flags = { key: value } (--key value or --key value1,value2)

    → switch(command):
        Maps CLI command to tool name + tool args

    → handleTool(toolName, toolArgs)  [SAME function as MCP]

    → Output: result.content (type === 'text')
        → isError → stderr
        → else → stdout

ENVIRONMENT:
  PROJECT_ROOT must be set (checked at line 32-35)
  
ROOT PACKAGE.JSON CLI SHORTCUTS:
  /media/islamux/Variety/JavaScriptProjects/bassaer/package.json
    → "cc:mcp": "cd command-center-mcp && node dist/index.js"  (MCP server)
    → "ccui": "node command-center-tui/dist/index.js"          (TUI)
```

**CLI Commands (mapped to MCP tools):**

| CLI Command | MCP Tool | Description |
|-------------|-----------|-------------|
| `get_task_context <id>` | `get_task_context` | Full task context (~8K tokens) |
| `get_task_summary <id>` | `get_task_summary` | Slim task summary (~500 tokens) |
| `get_project_status` | `get_project_status` | Project status overview |
| `get_milestone_overview <id>` | `get_milestone_overview` | Milestone details |
| `list_tasks [--flags]` | `list_tasks` | Filter and list tasks |
| `get_task_history <id>` | `get_task_history` | Task action history |
| `list_agents` | `list_agents` | List registered agents |
| `get_activity_feed [--flags]` | `get_activity_feed` | Recent activity |
| `start_task <id> [--agent_id]` | `start_task` | Start a task |
| `complete_task <id> <summary>` | `complete_task` | Mark task for review |
| `approve_task <id> [feedback]` | `approve_task` | Approve and mark done |
| `reject_task <id> <feedback>` | `reject_task` | Reject and send back |
| `reset_task <id>` | `reset_task` | Reset to todo |
| `block_task <id> <reason>` | `block_task` | Block a task |
| `unblock_task <id> [resolution]` | `unblock_task` | Unblock a task |
| `update_task <id> [--flags]` | `update_task` | Update task fields |
| `log_action <id> <action> <desc>` | `log_action` | Log custom action |
| `enrich_task <id> [--flags]` | `enrich_task` | Add context to task |
| `add_milestone_note <id> <note>` | `add_milestone_note` | Add note to milestone |
| `set_milestone_dates <id> [--flags]` | `set_milestone_dates` | Set dates |
| `update_drift <id> <days>` | `update_drift` | Set drift days |
| `create_milestone <id> <title> [--flags]` | `create_milestone` | Create milestone |
| `add_milestone_task <id> <label> [--flags]` | `add_milestone_task` | Add task to milestone |
| `register_agent <id> <name> <type> [--flags]` | `register_agent` | Register agent |

---

### 5. Agent Interaction Flow (How Agents Call MCP Tools)

```
AGENT DEFINITIONS:
  /media/islamux/Variety/JavaScriptProjects/bassaer/.mcp.json
    → Defines 6 agents: orchestrator, explorer, researcher, post-build-auditor, arabic-specialist, nextjs-specialist
    → Each has: name, type, parent_id, color, permissions (READ, WRITE, EXECUTE, DISPATCH, ADMIN)

MCP SERVER CONNECTION:
  Agent (AI model) → MCP stdio transport → 
    /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/index.ts
    → Server handles ListToolsRequest, CallToolRequest

TOOL EXECUTION:
  Agent sends: { method: "tools/call", params: { name: "tool_name", arguments: { ... } } }
    → handleTool(name, args) in tools.ts
    → Service function (e.g., startTask())
        → readTracker() → mutate state → pushLog() → touchAgent() → writeTracker()
    → Returns: { content: [{ type: "text", text: "..." }], isError: boolean }

AGENT WORKFLOW (from .mcp.json):
  Prepare Phase:
    1. get_task_context → get full context
    2. dispatch_explorer → explore codebase (not implemented)
    3. dispatch_researcher → research approach (not implemented)
    4. enrich_task → add findings to task

  Start Phase:
    1. start_task → set status to in_progress
    2. get_task_context → refreshed context
    3. implement → agent writes code (external)
    4. validate → agent validates (external)
    5. dispatch_auditor → audit result (not implemented)
    6. complete_task → mark for review

TASK LIFECYCLE (enforced by state machine):
  todo → in_progress → review → done
                    ↓
              in_progress (reject)
  Any → blocked → todo/in_progress (unblock)
```

**Agent Service Layer (partially implemented):**
- `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/agent-dispatch.service.ts`
  - `findBestAgent()`, `dispatchTask()`, `checkPermission()`, `updateHeartbeat()`
  - `validateResult()` — basic keyword matching for acceptance criteria
  - **NOT YET WIRED TO MCP TOOLS** (no `dispatch_agent` tool exists)

---

## [ARCHITECTURE]

### 1. Entry Points

| Component | Absolute Path | Description |
|-----------|---------------|-------------|
| **MCP Server** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/index.ts` | MCP stdio server, 32 lines. Sets up `@modelcontextprotocol/sdk` server, registers `ListToolsRequestSchema` and `CallToolRequestSchema` handlers. |
| **CLI** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/cli.ts` | CLI entry point, 176 lines. Parses argv, maps to tool names, calls `handleTool()`. Requires `PROJECT_ROOT` env var. |
| **TUI** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/index.ts` | TUI entry point, 112 lines. Creates blessed screen, sets up file watcher on `project-tracker.json`, renders views. |

---

### 2. Core Services

| Service | Absolute Path | Description |
|---------|---------------|-------------|
| **tracker.service.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/tracker.service.ts` | Core service: `readTracker()`, `writeTracker()`, `findTask()`, `allMilestones()`, `computeOverallProgress()`, `computeScheduleStatus()`, `touchAgent()`, `pushLog()`, `pushHistory()`, `autoUnblockDependents()`, `generateTaskId()` |
| **task.service.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/task.service.ts` | Task lifecycle: `startTask()`, `completeTask()`, `approveTask()`, `rejectTask()`, `resetTask()`, `blockTask()`, `unblockTask()`, `updateTask()`, `logAction()`, `enrichTask()` |
| **milestone.service.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/milestone.service.ts` | Milestone management: `addMilestoneNote()`, `setMilestoneDates()`, `updateDrift()`, `createMilestone()`, `addMilestoneTask()`, `moveMilestoneToCompleted()` |
| **agent.service.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/agent.service.ts` | Agent management: `registerAgent()` |
| **agent-dispatch.service.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/agent-dispatch.service.ts` | Agent dispatch (incomplete): `getAgent()`, `getAvailableAgents()`, `findBestAgent()`, `dispatchTask()`, `checkPermission()`, `updateHeartbeat()`, `checkAgentHeartbeats()`, `validateResult()` |
| **migration.service.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/migration.service.ts` | Schema migration (stub): `runMigrations()`, `getPendingMigrations()`, `getSchemaVersion()`. Currently a no-op (only sets `_schema_version = 1`). |
| **task-index.service.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/task-index.service.ts` | Optional task index for O(1) lookups: `buildTaskIndex()`, `findTaskFast()`, `rebuildIndexIfNeeded()` |

---

### 3. Shared Types Location

```
Package: command-center-shared
Root: /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-shared/

Source Files:
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-shared/src/index.ts
    → Re-exports from types.ts and schema.ts

  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-shared/src/types.ts
    → TypeScript interfaces:
       SubtaskStatus, Priority, ExecutionMode, AgentType, ScheduleStatus
       ProjectMeta, Dashboard, Subtask, Milestone, CompletedMilestone
       CategorizedMilestones, Agent, AgentLogEntry, HistoryLogEntry
       Phase, TrackerState, ServiceResult, FoundTask
       allMilestones() helper function

  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-shared/src/schema.ts
    → Zod schemas:
       SubtaskStatusSchema, PrioritySchema, ExecutionModeSchema
       SubtaskSchema, MilestoneSchema, CompletedMilestoneSchema
       CategorizedMilestonesSchema, DashboardSchema, ProjectMetaSchema
       HistoryLogEntrySchema, TrackerStateSchema

Dist (compiled):
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-shared/dist/index.js
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-shared/dist/types.js
  /media/islamux/Variety/JavaScriptProjects/bassaer/command-center-shared/dist/schema.js
```

**Important:** The `command-center-mcp/src/types.ts` file still contains DUPLICATE type definitions that should be replaced with imports from `command-center-shared`. The TUI `src/types.ts` also has its own duplicate types.

---

### 4. Storage Layer

| File | Absolute Path | Description |
|------|---------------|-------------|
| **tracker-file.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/storage/tracker-file.ts` | Core file I/O: `TRACKER_PATH = path.join(PROJECT_ROOT, 'project-tracker.json')`, `readRaw()` (readFileSync), `writeAtomic()` (temp file + renameSync), `withLock()` (PID-based file locking with 5s timeout) |
| **backup.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/storage/backup.ts` | Backup system: `createBackup(operation)` writes to `.cc-backups/tracker-<timestamp>.json`, maintains `undo-log.json` (max 20 entries), cleans up old backups |
| **log-rotation.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/storage/log-rotation.ts` | Agent log rotation: `rotateAgentLog()` caps in-memory log at 500 entries, archives to `.cc-backups/agent-log-archive/` in chunks of 100, limits to 10 archive files |

**Backup Directory:** `/media/islamux/Variety/JavaScriptProjects/bassaer/.cc-backups/`
- Tracker backups: `tracker-<timestamp>.json`
- Undo log: `undo-log.json`
- Agent log archive: `agent-log-archive/agent-log-<timestamp>-<count>.json`

---

### 5. UI Views

| View | Absolute Path | Description |
|------|---------------|-------------|
| **Swim Lane** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/views/swim-lane.ts` | Tab 1: Shows active milestones (with progress bars), backlog, completed (last 5). Uses `progressBar()` helper. |
| **Task Board** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/views/task-board.ts` | Tab 2: Kanban board with columns: TODO, IN PROGRESS, REVIEW, DONE, BLOCKED. Displays priority badges, assignees. |
| **Agent Hub** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/views/agent-hub.ts` | Tab 3: Lists registered agents (status, permissions, action count), shows recent activity from `history_log`. |
| **Calendar** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/views/calendar.ts` | Tab 4: Project timeline (week markers), completed milestones by date, activity by date. |

**Components:**

| Component | Absolute Path | Description |
|-----------|---------------|-------------|
| **tab-bar.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/components/tab-bar.ts` | Renders tab navigation: `[1]Swim Lane │ [2]Task Board │ [3]Agent Hub │ [4]Calendar` |
| **status-bar.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/components/status-bar.ts` | Footer: Week, Schedule Status, Progress, Active/Backlog/Done counts, Current Focus |

**Supporting Files:**

| File | Absolute Path | Description |
|------|---------------|-------------|
| **store.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/store.ts` | State container: `TrackerState \| null`, `loadFromDisk()`, extends `EventEmitter` |
| **config.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/config.ts` | `findProjectRoot()` walks up from `cwd` looking for `project-tracker.json`, `getTrackerPath()` returns full path |
| **theme.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/theme.ts` | Dark/light themes, `statusColor()`, `statusIcon()`, `priorityBadge()` helpers |

---

## [ORPHANS & PENDING]

### 1. Files That Exist But Aren't Referenced

| File | Absolute Path | Notes |
|------|---------------|-------|
| **command-center-mcp/src/types.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/types.ts` | **ORPHAN** — Contains duplicate type definitions. The shared types should be imported from `command-center-shared` instead. Currently still used by MCP services (imports from `./types.js`). |
| **command-center-tui/src/types.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-tui/src/types.ts` | **ORPHAN** — Contains duplicate type definitions (also has `done: boolean` field that `command-center-shared` doesn't have). Should import from `command-center-shared`. |
| **migration.service.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/migration.service.ts` | **NOT IMPORTED** — The `runMigrations()` function is never called in the codebase. The `migrateTracker` referenced in the audit doesn't exist; this file is the replacement but isn't wired up. |
| **task-index.service.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/task-index.service.ts` | **NOT IMPORTED** — The `buildTaskIndex()` and `findTaskFast()` functions are never used. The codebase still uses linear `findTask()` scans. |
| **agent-dispatch.service.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/agent-dispatch.service.ts` | **NOT WIRED TO MCP TOOLS** — Contains `dispatchTask()`, `findBestAgent()`, etc. but no MCP tool calls these functions. Agent dispatch is not implemented. |
| **log-rotation.ts** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/storage/log-rotation.ts` | **NOT CALLED** — `rotateAgentLog()` is never invoked. The `agent_log` array grows without bound. |
| **scripts/cc-dash.py** | `/media/islamux/Variety/JavaScriptProjects/bassaer/scripts/cc-dash.py` | Referenced in root `package.json` as `cc`, `cc:watch`, `cc:update`, `cc:log` scripts. This is a Python terminal dashboard (alternative to the Node.js TUI). |
| **.mcp.json** | `/media/islamux/Variety/JavaScriptProjects/bassaer/.mcp.json` | Configuration for MCP agents and workflow definitions. Read by MCP clients (e.g., Claude Desktop, OpenCode). |

---

### 2. Incomplete Implementations

| Item | Location | Status |
|------|----------|--------|
| **Agent Dispatch** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/agent-dispatch.service.ts` | **INCOMPLETE** — Functions exist (`dispatchTask`, `findBestAgent`, `checkPermission`) but no MCP tool invokes them. No `dispatch_agent` tool is registered. The workflow in `.mcp.json` references `dispatch_explorer`, `dispatch_researcher`, `dispatch_auditor` which don't exist. |
| **Migration Framework** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/migration.service.ts` | **NO-OP** — `runMigrations()` exists but is never called. The `CURRENT_SCHEMA_VERSION = 1` with a single stub migration (`remove_done_field` which doesn't apply to current schema). No actual schema transformation is implemented. |
| **Agent Permission Enforcement** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/agent-dispatch.service.ts` (line 90-93) | **INCOMPLETE** — `checkPermission()` function exists but is never called in tool handlers. Agents have `permissions: string[]` but all agents can perform all operations regardless of permissions. |
| **Agent Heartbeat/Health** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/services/agent-dispatch.service.ts` (line 107-135) | **INCOMPLETE** — `updateHeartbeat()` and `checkAgentHeartbeats()` exist but are never called. No periodic heartbeat mechanism is implemented. Agent "active" status in TUI is based on `last_action_at` but no automatic status updates occur. |
| **Log Rotation** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/storage/log-rotation.ts` | **INCOMPLETE** — `rotateAgentLog()` function exists but is never called. The `agent_log` array in `project-tracker.json` grows without bound. |
| **Event Bus** | (Nowhere) | **NOT IMPLEMENTED** — The audit suggests an event-driven architecture for agent coordination (e.g., auto-unblock as event handler). No event bus exists. |
| **Undo Command** | (Nowhere) | **INCOMPLETE** — `backup.ts` has `getLastUndo()` and `popUndo()` functions, and `undo-log.json` is maintained, but no `cc undo` CLI command or MCP tool exists to use it. |
| **CLI Help** | `/media/islamux/Variety/JavaScriptProjects/bassaer/command-center-mcp/src/cli.ts` | **INCOMPLETE** — No `--help` flag support. Running `cc` with no args prints a simple usage message, but `cc --help` and `cc start-task --help` don't work. |
| **Version Command** | (Nowhere) | **MISSING** — `cc --version` doesn't work. No version output from CLI. |

---

### 3. Known Issues from COMMAND_CENTER_AUDIT.md

> **Source:** `/media/islamux/Variety/JavaScriptProjects/bassaer/web/docs/COMMAND_CENTER_AUDIT.md`  
> **Audit Date:** May 2026  
> **Overall Quality Score:** 5.5 / 10

#### Critical Issues

| ID | Issue | Location | Status in Current Codebase |
|----|-------|----------|---------------------------|
| **C1** | **Concurrent Write Corruption** | `tracker-file.ts:writeAtomic()`, `store.ts:loadFromDisk()` | **PARTIALLY FIXED** — `writeAtomic()` now uses temp file + `renameSync` (atomic on POSIX). `withLock()` implements PID-based file locking with 5s timeout. However, the TUI only reads (doesn't write directly), so the lock mainly protects MCP/CLI writes. |
| **C2** | **CLI/MCP Logic Divergence** | `cli.ts` (176 lines) vs `tools.ts` (486 lines) | **PARTIALLY FIXED** — Both now call shared service functions in `services/*.service.ts`. The CLI is a thin wrapper (176 lines) and `tools.ts` is reduced to tool definitions + handlers that call services. However, some duplication may remain in the `switch` statements. |
| **C3** | **`migrateTracker` is a No-Op** | `migration.service.ts` | **STILL A NO-OP** — `runMigrations()` exists but is never called in `readTracker()`. The function only sets `_schema_version = 1` without actual schema transformations. |

#### High Priority Issues

| ID | Issue | Location | Status in Current Codebase |
|----|-------|----------|---------------------------|
| **H1** | **Zero Runtime Validation** | All files calling `readTracker()` | **PARTIALLY FIXED** — `command-center-mcp` now uses `TrackerStateSchema.parse(parsed)` (Zod validation) in `tracker.service.ts:readTracker()` (line 9). However, the **TUI still has NO validation**: `store.ts:loadFromDisk()` uses `JSON.parse(raw) as TrackerState` (unsafe cast, line 23). |
| **H2** | **Duplicate Type Definitions** | `command-center-mcp/src/types.ts` vs `command-center-shared/src/types.ts` | **PARTIALLY FIXED** — `command-center-shared/` package now exists with proper types and Zod schemas. However, `command-center-mcp/src/types.ts` still contains duplicate definitions and is used by the MCP services. The TUI `src/types.ts` also has duplicates. Full migration to shared types is incomplete. |
| **H3** | **Unsafe Type Assertions** | Pervasive in `tools.ts`, `cli.ts` | **IMPROVED** — With Zod validation in `readTracker()`, parsed data is now validated. However, tool input arguments (`args.task_id as string`, etc.) still use unsafe casts without validation. `getToolDefinitions()` defines JSON Schema for MCP clients, but the actual `args` object is not validated against it at runtime. |
| **H4** | **TUI Full Rebuild on State Change** | `index.ts:renderAll()` (line 70-98) | **NOT FIXED** — `renderAll()` still destroys and recreates ALL widgets (tabBar, statusBar, currentView) on every state change. This causes flickering and loses scroll position/focus. The audit recommends incremental updates. |
| **H5** | **`findProjectRoot` Divergence** | MCP: `tracker-file.ts` (uses `PROJECT_ROOT` env var) vs TUI: `config.ts:findProjectRoot()` (walks up from `cwd`) | **STILL UNIFIED** — MCP uses `PROJECT_ROOT` environment variable (set in `.mcp.json`). TUI walks up from `cwd` looking for `project-tracker.json`. They could resolve to different paths in edge cases. Should be unified. |

#### Medium Priority Issues (from Audit)

| ID | Issue | Notes |
|----|-------|-------|
| **M1** | **`done` and `status` Redundancy** | `Subtask` has both `done: boolean` and `status: SubtaskStatus`. The TUI types still include `done` field, but the shared types and MCP types appear to have removed it (or it's being phased out). |
| **M2** | **Unbounded Agent Log** | `log-rotation.ts` exists but `rotateAgentLog()` is never called. Agent log grows without limit in `project-tracker.json`. |
| **M3** | **`generateTaskId` Collision Risk** | Uses `existingSubtasks.length + 1`. If tasks are deleted, IDs could collide. Should use max numeric suffix. |
| **M4** | **Module-Level Mutable State in TUI Views** | Views use closures over `milestoneIdx`, `activeTab` from `index.ts`. These are managed properly, but the audit notes that module-level state in views could become stale. |
| **M5** | **No Error Recovery in TUI** | If `project-tracker.json` is missing/corrupt, TUI shows error but has no retry mechanism. |
| **M6** | **Blueprint-Implementation Mismatch** | The audit mentions `command-center-blueprint.md` describes Python/Textual but actual implementation is Node.js/blessed. This doc wasn't found in the codebase. |

---

## Summary

The Basaar Command Center has evolved from the audit findings:

**Improvements Made:**
1. Extracted service layer (`services/*.service.ts`) — business logic separated from MCP tools and CLI
2. Added `command-center-shared/` package with Zod schemas and TypeScript types
3. Implemented atomic writes with `writeAtomic()` (temp file + rename)
4. Added file locking with `withLock()` (PID-based)
5. Added Zod validation in MCP's `readTracker()`

**Still Pending (from Audit):**
1. Wire up `migration.service.ts` — call `runMigrations()` in `readTracker()`
2. Complete migration to `command-center-shared` — remove duplicate types in MCP and TUI
3. Add tool input validation (validate `args` against schemas)
4. Fix TUI full rebuild — implement incremental rendering
5. Wire up `log-rotation.ts` — call `rotateAgentLog()` when agent_log grows
6. Implement agent dispatch — create `dispatch_agent` MCP tool
7. Enforce agent permissions in tool handlers
8. Add agent heartbeat mechanism
9. Unify `findProjectRoot` between MCP and TUI
10. Add `cc undo` command using the undo log

**Files Not Yet Created (from Audit Recommendations):**
- `command-center-mcp/src/tools/registry.ts` — centralized tool registration
- `command-center-mcp/src/tools/task.tools.ts`, `milestone.tools.ts`, etc. — split monolithic `tools.ts`
- TUI `components/detail-modal.ts` — extract from task-board.ts
- Event bus for agent coordination

---

**End of PROJECT MAP**
