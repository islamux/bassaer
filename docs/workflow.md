# Basaar Command Center — Workflow Documentation

This document describes the task lifecycle state machine and agent interaction patterns for the Basaar Arabic Digital Book project.

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
           └──► back to IN PROGRESS
```

## State Transition Table

| Current State | Trigger | MCP Tool | Agent Dispatch | Next State |
|--------------|---------|----------|---------------|------------|
| `todo` | Operator says "prepare task X" | `get_task_context` | Explorer, then Researcher | `todo` (enriched) |
| `todo` | Operator says "start task X" | `start_task` | — | `in_progress` |
| `in_progress` | Implementation complete | — | — | `in_progress` |
| `in_progress` | Build/typecheck/lint pass | — | Post-Build Auditor | `in_progress` |
| `in_progress` | Auditor passes | `complete_task` | — | `review` |
| `review` | Operator gives code feedback | `reject_task` | — | `in_progress` |
| `review` | Operator approves | `approve_task` | — | `done` |
| `any` | Blocker encountered | `block_task` | — | `blocked` |
| `blocked` | Blocker resolved | `unblock_task` | — | `todo` or `in_progress` |

## Workflow Phases

### Prepare Phase (Enrichment)

When the operator says "prepare task X":

1. **Get context:** Call `get_task_context(task_id)` to read the task
2. **Dispatch Explorer agent:**
   - Pass the task_id and ask it to investigate the codebase
   - Explorer returns: relevant files, existing patterns, gaps, integration points
   - Explorer MUST call `log_action(task_id, "exploration_complete", summary, agent_id: "explorer")`
3. **Dispatch Researcher agent:**
   - Pass the task_id AND a compressed brief of explorer findings (max 500 tokens — file paths, patterns, gaps, not raw output)
   - Researcher looks up external docs, API references, best practices
   - Researcher MUST call `log_action(task_id, "research_complete", summary, agent_id: "researcher")`
4. **Ask operator** clarifying questions if ambiguity remains (skip if already answered)
5. **Write prompt file** at `docs/prompts/{task_id}.md` incorporating explorer findings + researcher findings + operator context
6. **Enrich task:** Call `enrich_task(task_id)` with updated acceptance criteria, constraints, context files, reference docs, and `builder_prompt` path
7. **Task stays in `todo`** — do NOT call `start_task`

### Start Phase (Implementation)

When the operator says "start task X":

1. **Start:** Call `start_task(task_id)` — moves to `in_progress`
2. **Get context:** Call `get_task_context(task_id)` to read the enriched task
3. **Implement:** The orchestrator (or builder agent) does the work
4. **Validate:** Run the project's build/typecheck/lint commands
   - If any fail: fix errors and re-run until clean
5. **Dispatch Post-Build Auditor:**
   - Pass `task_id` AND an explicit list of modified files
   - Auditor performs: build validation, code review, security scan
   - Auditor MUST call `log_action(task_id, "audit_complete", summary, agent_id: "post-build-auditor")`
   - If auditor returns "FIXED": re-run build/typecheck/lint
   - If auditor returns "FAIL" it could not resolve: do NOT call `complete_task` — report to operator
6. **Complete:** Call `complete_task(task_id, summary)` — moves to `review`

### Review Phase

When the operator gives feedback on a task in `review`:

- **If feedback involves ANY code changes** (refactoring, fixes, additions, modifications):
  1. IMMEDIATELY call `reject_task(task_id, feedback)` — moves back to `in_progress`
  2. Do the work
  3. Re-run validation + auditor
  4. Call `complete_task(task_id, summary)` to resubmit

- **If feedback is purely conversational** (questions, "explain why you..."):
  - Answer the question, keep task in `review`

### Approve Phase

When the operator explicitly says "approve task X" / "complete task X" / "done":

1. Call `approve_task(task_id)` — moves to `done`
2. Auto-unblock cascade runs (downstream dependent tasks are unblocked if all their dependencies are now satisfied)

**This is the ONLY way a task reaches `done`. Never call `approve_task` without explicit operator instruction.**

## General Rules

1. **Never auto-approve**: Tasks must be explicitly approved by the operator
2. **Always log actions**: Every agent must call `log_action` when completing its work
3. **Preserve state**: Never modify task state outside of the defined MCP tools
4. **Validation first**: Always run build/typecheck/lint before calling `complete_task`
5. **Document everything**: Maintain clear logs and context for operator review

## Basaar-Specific Considerations

For the Basaar Arabic Digital Book project:

1. **Content tasks**: Always dispatch the Arabic Content Specialist for review
2. **Next.js tasks**: Always dispatch the Next.js Specialist for validation
3. **RTL considerations**: Extra care required for layout and styling tasks
4. **Arabic text**: Validate text rendering and formatting in all content tasks

## Agent Role Definitions

See `docs/agent-roles.md` for detailed agent responsibilities and dispatch patterns.
