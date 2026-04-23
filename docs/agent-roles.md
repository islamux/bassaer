# Basaar Command Center — Agent Roles

This document defines the agent roles and their responsibilities within the Basaar Arabic Digital Book project.

## Standard Agent Roles

### Orchestrator

**Role:** Master coordinator that manages the overall workflow and dispatches sub-agents.

**Responsibilities:**
- Coordinate task execution across multiple agents
- Maintain context and state consistency
- Handle operator communication
- Ensure proper logging and tracking
- Manage task lifecycle transitions

**Dispatch Pattern:** Always active, manages all task workflows

### Explorer

**Role:** Codebase investigator that analyzes existing code and patterns.

**Responsibilities:**
- Investigate relevant files and dependencies
- Identify existing patterns and conventions
- Find integration points and gaps
- Document codebase structure
- Provide context for implementation

**When dispatched:** During Prepare Phase for all tasks

**Must call:** `log_action(task_id, "exploration_complete", summary, agent_id: "explorer")`

### Researcher

**Role:** External knowledge gatherer that finds documentation and best practices.

**Responsibilities:**
- Research external documentation
- Find API references and specifications
- Identify best practices and patterns
- Gather relevant examples and tutorials
- Provide contextual knowledge

**When dispatched:** During Prepare Phase after Explorer completes

**Must call:** `log_action(task_id, "research_complete", summary, agent_id: "researcher")`

### Post-Build Auditor

**Role:** Quality assurance agent that validates completed work.

**Responsibilities:**
- Validate build success
- Perform code review
- Check for security issues
- Verify adherence to conventions
- Ensure proper error handling

**When dispatched:** During Start Phase after implementation

**Must call:** `log_action(task_id, "audit_complete", summary, agent_id: "post-build-auditor")`

## Basaar-Specific Agent Roles

### Arabic Content Specialist

**Role:** Arabic text quality reviewer and RTL layout expert.

**Responsibilities:**
- Review Arabic text for spelling and grammar errors
- Verify markdown formatting for RTL context
- Check chapter titles and headings formatting
- Validate blockquote styling and emphasis markers
- Ensure consistent punctuation and spacing
- Test RTL layout and rendering

**When dispatched:** During Content domain tasks and final review

**Must call:** `log_action(task_id, "arabic_review_complete", description, agent_id: "arabic-specialist")`

### Next.js Specialist

**Role:** Next.js App Router expert ensuring best practices.

**Responsibilities:**
- Verify App Router patterns (server/client components)
- Check static generation (SSG) works correctly
- Ensure image optimization via next/image
- Validate metadata API usage
- Check data fetching patterns
- Test routing and navigation

**When dispatched:** During Features and Infrastructure tasks

**Must call:** `log_action(task_id, "nextjs_review_complete", description, agent_id: "nextjs-specialist")`

## Agent Dispatch Patterns

### Content Domain Tasks

1. **Prepare Phase:** Explorer → Researcher → Arabic Content Specialist
2. **Start Phase:** Implementation → Post-Build Auditor → Arabic Content Specialist
3. **Review Phase:** Operator feedback → (if changes) re-implement → Post-Build Auditor → Arabic Content Specialist

### UI/UX Domain Tasks

1. **Prepare Phase:** Explorer → Researcher
2. **Start Phase:** Implementation → Post-Build Auditor → Next.js Specialist (for React/Next.js tasks)
3. **Review Phase:** Operator feedback → (if changes) re-implement → Post-Build Auditor

### Features Domain Tasks

1. **Prepare Phase:** Explorer → Researcher
2. **Start Phase:** Implementation → Post-Build Auditor → Next.js Specialist
3. **Review Phase:** Operator feedback → (if changes) re-implement → Post-Build Auditor → Next.js Specialist

### Scripts Domain Tasks

1. **Prepare Phase:** Explorer → Researcher
2. **Start Phase:** Implementation → Post-Build Auditor
3. **Review Phase:** Operator feedback → (if changes) re-implement → Post-Build Auditor

### Infrastructure Domain Tasks

1. **Prepare Phase:** Explorer → Researcher
2. **Start Phase:** Implementation → Post-Build Auditor → Next.js Specialist (for Next.js-specific infra)
3. **Review Phase:** Operator feedback → (if changes) re-implement → Post-Build Auditor

## Agent Communication Protocol

### Logging Requirements

All agents MUST call `log_action` with the following parameters:
- `task_id`: The task being worked on
- `action`: The action being completed (e.g., "exploration_complete", "audit_complete")
- `description`: Summary of what was done and findings
- `agent_id`: The agent's ID
- `tags`: Relevant tags (e.g., ["RESEARCH", "CONTENT"])

### Context Passing

When agents need to pass context:
- Keep summaries concise (< 500 tokens)
- Focus on key findings and decisions
- Reference files by path, not content
- Use structured formats when possible

### Error Handling

When agents encounter issues:
- Log the error with `log_action` using "ALERT" tag
- Provide clear error description
- Suggest potential solutions
- Do NOT modify task state on errors
- Report to orchestrator for operator notification

## Agent Performance Monitoring

The Command Center tracks:
- Actions per session
- Time between actions
- Success/failure rates
- Blockers encountered
- Operator feedback patterns

This data is used to improve agent performance and identify workflow bottlenecks.
