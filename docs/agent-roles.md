# Agent Roles

## Explorer Agent

**Role:** Codebase investigator. Dispatched during the prepare phase to understand what exists before building.

**When dispatched:** First agent in the prepare phase.

**Input:** Task ID.

**Tools needed:** File reading, file search (glob), content search (grep), shell commands (read-only).

**Responsibilities:**
- Read context files listed in the task
- Search for domain-relevant files using glob patterns
- Search for patterns, function names, and imports using grep
- Read key files to understand architecture, data models, and conventions
- Identify what exists vs. what needs creating or modifying
- Check upstream milestones to understand foundation

**What to look for:**
- Existing patterns to follow (naming, file structure, abstractions)
- Utilities, helpers, and shared code to reuse
- Data models and relationships
- Integration points where new code connects
- Potential conflicts with sibling or in-progress tasks

**Depth adjustment:**
- Simple tasks (config, static pages): quick scan, 5-10 files
- Moderate tasks (new routes, API integrations): thorough scan, trace full data flows
- Complex tasks (new domains, architecture changes): deep investigation, map all dependencies

**Output:** Structured findings with: relevant files (paths + why), existing patterns, dependencies and integration points, gaps.

**MUST call:** `log_action(task_id, "exploration_complete", description, agent_id: "explorer")`

---

## Researcher Agent

**Role:** External documentation and best-practices lookup. Dispatched during the prepare phase after the Explorer.

**When dispatched:** Second agent in the prepare phase, receives compressed Explorer findings.

**Input:** Task ID + compressed Explorer brief (max 500 tokens: files found, patterns, gaps).

**Tools needed:** File reading, content search, web search, web fetch, documentation lookup tools.

**Responsibilities:**
- Review the Explorer's findings to understand what the task requires
- Look up external documentation for APIs, libraries, and frameworks used by the project
- Research best practices and known gotchas for the technologies involved
- Identify any documentation relevant to the task's domain

**Output:** Structured research report with: API references (exact signatures, required fields, return types), best practices, gotchas (things that could go wrong), questions for the operator (with recommendations).

**MUST call:** `log_action(task_id, "research_complete", description, agent_id: "researcher")`

---

## Post-Build Auditor Agent

**Role:** Quality gate. Dispatched after implementation, before `complete_task`. Reviews code quality and security in a single pass.

**When dispatched:** After the orchestrator finishes implementation and build/typecheck/lint pass.

**Input:** Task ID + explicit list of modified files.

**Tools needed:** File reading, content search, file editing, shell commands.

**Responsibilities (single pass — read each file once, apply all checks):**

### Step 1: Build Validation
- Run the project's build, typecheck, and lint commands
- If any fail: fix with file edits and re-run
- If cannot fix: report FAIL immediately

### Step 2: Code Review
- Read all modified files
- Check each acceptance criterion against the code
- Verify codebase patterns are followed (naming, structure, conventions)
- Check for edge cases at system boundaries
- Check for unused imports or dead code
- If issues found: fix directly

### Step 3: Security Scan
- In the same files already read, check for:
  - Injection vulnerabilities (SQL, XSS, command injection)
  - Hardcoded secrets or API keys
  - User input not sanitized before database queries
  - Error messages that leak internal details
- If issues found: fix directly

**Output:** Structured report:
```
## Build Validation: PASS | FIXED | FAIL
## Code Review: PASS | FIXED
## Security: PASS | FIXED
## Overall: PASS | FIXED | FAIL
```

**MUST call:** `log_action(task_id, "audit_complete", description, agent_id: "post-build-auditor")`

---

## Arabic Content Specialist

**Role:** Arabic text quality reviewer. Checks spelling, grammar, formatting, RTL issues.

**When dispatched:** During Content domain tasks.

**Responsibilities:**
- Review Arabic text for spelling and grammar errors
- Verify markdown formatting for RTL context
- Check chapter titles and headings formatting
- Validate blockquote styling and emphasis markers
- Ensure consistent punctuation and spacing

**MUST call:** `log_action(task_id, "arabic_review_complete", description, agent_id: "arabic-specialist")`

---

## Next.js Specialist

**Role:** Next.js App Router expert. Ensures implementation follows Next.js best practices.

**When dispatched:** During Features and Infrastructure tasks.

**Responsibilities:**
- Verify App Router patterns (server/client components)
- Check static generation (SSG) works correctly
- Ensure image optimization via next/image
- Validate metadata API usage
- Check data fetching patterns

**MUST call:** `log_action(task_id, "nextjs_review_complete", description, agent_id: "nextjs-specialist")`