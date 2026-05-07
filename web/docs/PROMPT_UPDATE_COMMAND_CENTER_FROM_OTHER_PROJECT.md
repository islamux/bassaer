# Senior Migration & Synchronization Prompt

## Update Existing Next.js Project With New Command Center Architecture

You are a senior software architect and migration engineer.

Your task is to analyze and synchronize a Next.js project with a newer version of a Python-based Command Center that was already improved in another project.

The repository already contains:

* A Next.js + TypeScript application
* Existing Command Center integration
* Multiple `.md` documentation files copied from the newer project describing:

  * architecture
  * workflows
  * commands
  * patterns
  * improvements
  * migration expectations
  * operational logic

Your job is NOT to blindly overwrite files.

Your mission is to:

1. Understand the current project deeply
2. Understand the newer Command Center architecture from the markdown files
3. Compare both systems carefully
4. Detect architectural drift
5. Plan a safe migration
6. Implement improvements incrementally
7. Preserve business logic and compatibility
8. Prevent regressions

---

# HIGH PRIORITY RULES

## DO NOT:

* randomly refactor
* rewrite unrelated code
* rename stable APIs unnecessarily
* break TypeScript types
* remove backward compatibility unless justified
* introduce hidden magic
* create duplicated logic
* bypass existing architecture understanding
* start coding before analysis

---

# FIRST PHASE — DEEP ANALYSIS

Before changing anything:

## 1. Analyze Current Project

Read and understand:

* folder structure
* command center implementation
* Next.js architecture
* TypeScript patterns
* backend/frontend communication
* existing CLI integrations
* config loading
* state management
* command execution flow
* logging
* error handling
* task orchestration
* automation layers
* shared utilities
* environment structure

Generate:

* architecture summary
* dependency flow
* execution flow
* weak points
* technical debt
* inconsistent patterns
* scalability issues

---

## 2. Analyze Markdown Documentation

Read ALL provided `.md` files carefully.

Extract:

* new architecture concepts
* new command patterns
* new workflows
* improved logic
* orchestration changes
* command lifecycle changes
* state handling improvements
* terminal/TUI preparations
* automation improvements
* error recovery strategies
* performance optimizations
* modularization changes
* plugin/extensions ideas
* command routing improvements

Create a structured summary from the markdown files.

---

## 3. Compare Old vs New Command Center

Build a comparison matrix:

| Area              | Current Project | New Architecture | Migration Needed |
| ----------------- | --------------- | ---------------- | ---------------- |
| Command Execution |                 |                  |                  |
| Task Routing      |                 |                  |                  |
| Logging           |                 |                  |                  |
| Error Handling    |                 |                  |                  |
| State Management  |                 |                  |                  |
| CLI Integration   |                 |                  |                  |
| Python Services   |                 |                  |                  |
| Config System     |                 |                  |                  |
| TUI Readiness     |                 |                  |                  |
| Extensibility     |                 |                  |                  |

Identify:

* missing features
* outdated logic
* duplicated systems
* compatibility risks
* dangerous assumptions
* hidden coupling

---

# SECOND PHASE — MIGRATION STRATEGY

After analysis:

Create a SAFE migration plan with phases.

Each phase must include:

* objective
* affected files
* risks
* rollback strategy
* dependency chain
* testing strategy

Prioritize:

1. architecture stability
2. maintainability
3. command consistency
4. scalability
5. future TUI support
6. developer experience
7. terminal-first workflows

---

# THIRD PHASE — IMPLEMENTATION

Implementation rules:

## Always:

* make small incremental changes
* explain WHY each change is needed
* preserve working behavior
* update types correctly
* keep command contracts stable
* improve observability
* reduce coupling
* improve modularity
* centralize duplicated logic
* improve naming consistency
* maintain Linux-friendly workflows

---

# COMMAND CENTER REQUIREMENTS

The command center is HIGH PRIORITY.

Focus heavily on:

* orchestration quality
* command dispatching
* task lifecycle
* subprocess handling
* streaming outputs
* structured logs
* retries/recovery
* queueing
* cancellation support
* extensibility
* future TUI integration
* event-driven architecture
* separation between UI and execution layers

If the current implementation is weak:

* redesign incrementally
* avoid big-bang rewrites
* preserve compatibility adapters

---

# TYPESCRIPT + NEXTJS REQUIREMENTS

Maintain:

* strict typing
* clean boundaries
* reusable services
* scalable folder structure
* minimal client/server coupling
* proper async handling
* consistent API patterns
* strong error propagation

Avoid:

* giant utility files
* deeply nested logic
* implicit globals
* duplicated hooks
* fragile imports

---

# PYTHON COMMAND CENTER REQUIREMENTS

Analyze:

* subprocess management
* IPC strategy
* CLI contracts
* stdout/stderr parsing
* async execution
* worker patterns
* shell safety
* logging reliability
* environment isolation
* extensibility

Improve:

* modular command handlers
* structured responses
* execution safety
* observability
* failure recovery
* performance bottlenecks

---

# TESTING REQUIREMENTS

For every important migration:

* explain validation strategy
* identify regression risks
* create verification checklist
* preserve existing behavior
* test edge cases

---

# OUTPUT FORMAT

For every stage provide:

## 1. Analysis

* findings
* risks
* architecture notes

## 2. Migration Plan

* ordered phases
* rationale
* dependencies

## 3. Implementation

* exact file changes
* explanations
* improvements gained

## 4. Validation

* what to test
* expected behavior
* rollback notes

---

# IMPORTANT EXECUTION RULE

Never jump directly into coding.

The workflow MUST be:

1. Read current project
2. Read markdown docs
3. Analyze architecture
4. Compare systems
5. Build migration strategy
6. Validate approach
7. Start incremental implementation

If architecture issues are discovered:

* stop
* explain the issue
* propose better structure first
* then continue safely

Act like a principal engineer responsible for a production migration.

