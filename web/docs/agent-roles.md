# Basaar Command Center — Agent Roles

This document defines the specialized AI agent roles used in the Basaar project. Agents interact with the project via MCP tools and follow the state machine defined in `web/docs/workflow.md`.

---

## Standard Roles

### Explorer Agent
**Role:** Codebase investigator. Dispatched during the **Prepare Phase** to understand existing patterns and integration points.
- **Input:** Task ID.
- **Responsibilities:**
    - Search for domain-relevant files and patterns.
    - Identify existing abstractions and utilities to reuse.
    - Map dependencies and integration points.
- **Completion Marker:** `log_action(task_id, "exploration_complete", summary, agent_id: "explorer")`

### Researcher Agent
**Role:** External knowledge and best-practices specialist. Dispatched during the **Prepare Phase** after the Explorer.
- **Input:** Task ID + Explorer findings.
- **Responsibilities:**
    - Look up library/framework documentation (Next.js, Tailwind, etc.).
    - Research best practices for the specific task.
    - Identify potential gotchas or edge cases.
- **Completion Marker:** `log_action(task_id, "research_complete", summary, agent_id: "researcher")`

### Post-Build Auditor Agent
**Role:** Quality gate and reviewer. Dispatched during the **Implementation Phase** after build/lint passes.
- **Input:** Task ID + list of modified files.
- **Responsibilities:**
    - Perform a thorough code review.
    - Check for security vulnerabilities and unsanitized inputs.
    - Verify adherence to project conventions.
    - Fix minor issues directly if possible.
- **Completion Marker:** `log_action(task_id, "audit_complete", summary, agent_id: "post-build-auditor")`

---

## Basaar-Specific Roles

### Arabic Content Specialist
**Role:** Arabic text quality reviewer. Dispatched for tasks in the **Content** domain.
- **Responsibilities:**
    - Review Arabic text for spelling, grammar, and OCR artifacts.
    - Verify Markdown formatting in an RTL context.
    - Ensure consistent punctuation and honorific usage.
    - Check image alt text and titles for linguistic correctness.
- **Completion Marker:** `log_action(task_id, "arabic_review_complete", description, agent_id: "arabic-specialist")`

### Next.js Specialist
**Role:** Next.js and React architecture expert. Dispatched for tasks in **Features** or **Infrastructure** domains.
- **Responsibilities:**
    - Verify App Router patterns (Server/Client components).
    - Ensure correct usage of Next.js APIs (Metadata, Image, etc.).
    - Check static site generation (SSG) and ISR configurations.
    - Optimize performance and accessibility.
- **Completion Marker:** `log_action(task_id, "nextjs_review_complete", description, agent_id: "nextjs-specialist")`
