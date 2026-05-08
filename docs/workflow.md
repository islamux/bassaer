# Basaar Command Center Workflow

## Task Lifecycle States

```
                     ┌──────────┐
                     │   TODO   │
                     └────┬─────┘
                          │ start_task()
                     ┌────▼─────┐         block_task()    ┌──────────┐
                     │IN PROGRESS├───────────────────────►│ BLOCKED  │
                     └────┬─────┘                         └────┬─────┘
                          │ complete_task()                     │ unblock_task()
                     ┌────▼─────┐                              │
            ┌────────┤  REVIEW  │◄─────────────────────────────┘
            │        └────┬─────┘         (returns to previous state)
            │             │ approve_task()
            │        ┌────▼─────┐
            │        │   DONE   │
            │        └──────────┘
            │ reject_task()
            │
            └► back to IN PROGRESS
```

## State Transition Table

| Current State | Trigger | MCP Tool | Agent Dispatch | Next State |
|--------------|---------|----------|---------------|------------|
| `todo` | Operator says "prepare task X" | `get_task_context` | Explorer, then Researcher | `todo` (enriched) |
| `todo` | Operator says "start task X" | `start_task` | — | `in_progress` |
| `in_progress` | Implementation complete | — | Post-Build Auditor | `in_progress` |
| `in_progress` | Build/typecheck/lint pass | — | Post-Build Auditor | `review` |
| `review` | Operator gives code feedback | `reject_task` | — | `in_progress` |
| `review` | Operator approves | `approve_task` | — | `done` |
| `any` | Blocker encountered | `block_task` | — | `blocked` |
| `blocked` | Blocker resolved | `unblock_task` | — | `todo` or `in_progress` |

## Prepare Phase (Enrichment)

When the operator says "prepare task X":

1. **Get context:** Call `get_task_context(task_id)` to read the task
2. **Dispatch Explorer agent:**
   - Pass the task_id and ask it to investigate the codebase
   - Explorer returns: relevant files, existing patterns, gaps, integration points
   - Explorer MUST call `log_action(task_id, "exploration_complete", summary, agent_id: "explorer")`
3. **Dispatch Researcher agent:**
   - Pass the task_id AND a compressed brief of explorer findings (max 500 tokens)
   - Researcher looks up external docs, API references, best practices
   - Researcher MUST call `log_action(task_id, "research_complete", summary, agent_id: "researcher")`
4. **Ask operator** clarifying questions if ambiguity remains
5. **Write prompt file** at `web/docs/prompts/{task_id}.md` (if prompts dir exists) or store in task's `builder_prompt` field
6. **Enrich task:** Call `enrich_task(task_id)` with updated acceptance criteria, constraints, context files
7. **Task stays in `todo`** — do NOT call `start_task`

## Start Phase (Implementation)

When the operator says "start task X":

1. **Start:** Call `start_task(task_id)` — moves to `in_progress`
2. **Get context:** Call `get_task_context(task_id)` to read the enriched task
3. **Implement:** The orchestrator (or builder agent) does the work
4. **Validate:** Run the project's build/typecheck/lint commands
5. **Dispatch Post-Build Auditor:**
   - Pass `task_id` AND an explicit list of modified files
   - Auditor performs: build validation, code review, security scan
   - Auditor MUST call `log_action(task_id, "audit_complete", summary, agent_id: "post-build-auditor")`
6. **Complete:** Call `complete_task(task_id, summary)` — moves to `review`

## Review Phase

When the operator gives feedback on a task in `review`:

- **If feedback involves ANY code changes:**
  1. IMMEDIATELY call `reject_task(task_id, feedback)` — moves back to `in_progress`
  2. Do the work
  3. Re-run validation + auditor
  4. Call `complete_task(task_id, summary)` to resubmit

- **If feedback is purely conversational:**
  - Answer the question, keep task in `review`

## Approve Phase

When the operator explicitly says "approve task X" / "complete task X" / "done":

1. Call `approve_task(task_id)` — moves to `done`
2. Auto-unblock cascade runs (downstream dependent tasks are unblocked if all their dependencies are satisfied)

This is the ONLY way a task reaches `done`. Never call `approve_task` without explicit operator instruction.

## General Rules

- Always call `start_task` before implementation. Never write code for a task in `todo`.
- Always call `complete_task` after finishing. Never leave a task stuck in `in_progress`.
- Use `log_action` to record significant events (files created, tests passed, architecture decisions).
- Use `block_task` if you hit a blocker you cannot resolve.
- If a task has revision history (from prior `reject_task` calls), address ALL prior feedback before resubmitting.