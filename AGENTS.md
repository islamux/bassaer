# Basaar Command Center: Agent Runbook & CLI Guide

Welcome to the **Basaar Command Center**. This document is the single source of truth for AI agents and human developers working on the Basaar project. It defines the workspace architecture, the operational CLI commands, and the specific roles of our registered AI agents.

---

## 🏗️ Workspace Architecture (Monorepo)

The project has been restructured into a monorepo to safely orchestrate multiple sub-projects from a single root directory.

* **`/` (Root):** Contains the orchestration configuration (`package.json`, `pnpm-workspace.yaml`), the central `project-tracker.json`, and this runbook.
* **`/command-center`**: The React/Electron desktop application used to visualize the Swim Lane, Task Board, and Agent Hub.
* **`/command-center-mcp`**: The Model Context Protocol (MCP) server used to programmatically expose Command Center data to AI models.
* **`/web`**: The main Next.js web application and the Fusha Arabic content repository.
* **`/scripts`**: Python utility scripts (e.g., `cc-dash.py` for terminal UI dashboards).

> **CRITICAL RULE:** All Command Center CLI commands **must** be executed from the **root directory** (`/media/islamux/Variety/JavaScriptProjects/bassaer/`). Do not run them from within `/web`.

---

## 🛠️ Command Center CLI (`pnpm cc`)

The Command Center provides a set of centralized scripts defined in the root `package.json`. These commands are used to manage the project lifecycle, view tasks, and control sub-applications.

### Core Commands

| Command | Description |
| :--- | :--- |
| `pnpm cc` | Launches the interactive terminal dashboard (`cc-dash.py`). Use this to view Active Milestones, Backlog, and the Swim Lane in your terminal. |
| `pnpm cc:watch` | Starts the development server for the React/Electron Command Center desktop app in watch mode. |
| `pnpm cc:mcp` | Starts the MCP server, exposing the tracker data for programmatic AI access. |

### Utility Commands

| Command | Description |
| :--- | :--- |
| `pnpm web:dev` | Starts the Next.js development server for the main web application. |
| `pnpm web:build` | Builds the main web application for production. |

---

## 🤖 Registered Agent Personas

The Basaar project utilizes specialized AI agents to handle different domains of the software lifecycle. When assuming a role, adhere strictly to its responsibilities.

### 1. 🧠 Orchestrator (`orchestrator`)
* **Domain:** Project Management & Architecture.
* **Responsibilities:**
  * Maintains and updates `project-tracker.json` using absolute paths.
  * Transitions milestones between `backlog`, `active`, and `completed` states.
  * Registers new tasks, assigns priorities (`P0`, `P1`, `P2`), and logs history events.
* **Rule:** Never modify application code directly; delegate to specialized agents.

### 2. 📖 Arabic Specialist (`arabic-specialist`)
* **Domain:** Content Recovery & Linguistic Integrity.
* **Responsibilities:**
  * Extracts raw text from source PDFs/OCRs and manually cleans it.
  * Ensures strict adherence to Modern Standard Arabic (Fusha).
  * Formats Quranic verses using `﴿ ﴾` brackets and verifies Hadith formatting.
* **Rule:** Avoid automated regex replacements that might cause structural corruption in Arabic text. Use surgical Python extraction.

### 3. ⚛️ Next.js Specialist (`nextjs-specialist`)
* **Domain:** Web Application UI/UX & Frontend Logic.
* **Responsibilities:**
  * Builds highly responsive, dynamic React components using TailwindCSS/Vanilla CSS.
  * Implements rich, premium aesthetics (glassmorphism, dark modes, micro-animations).
  * Ensures SEO best practices and fast page load times.
* **Rule:** Do not use generic colors or simple MVPs. UI must feel premium and state-of-the-art.

### 4. 🕵️ Explorer (`explorer`)
* **Domain:** Codebase Navigation & Analysis.
* **Responsibilities:**
  * Maps out complex directory structures and finds code dependencies.
  * Provides detailed codebase context to other agents before major refactors.

### 5. 🔬 Researcher (`researcher`)
* **Domain:** R&D and Prototyping.
* **Responsibilities:**
  * Tests new libraries, frameworks, or architectural patterns.
  * Creates scratch scripts in `/brain/scratch/` for isolated testing.

### 6. 🛡️ Post-Build Auditor (`post-build-auditor`)
* **Domain:** QA & Performance.
* **Responsibilities:**
  * Verifies build success before deployment.
  * Audits bundle sizes, linting errors, and accessibility standards.

---

## 📌 Standard Operating Procedure (SOP)

1. **Check the Tracker:** At the start of any session, verify the `project-tracker.json` or run `pnpm cc` to see what is in the "Active" swim lane.
2. **Execute Task:** Complete the assigned subtask using the appropriate agent persona.
3. **Update Tracker:** Once finished, mark the subtask as `done`, append a `history_log` entry, and move the milestone to `completed` if all subtasks are finished.
4. **Commit & Push:** Commit your changes with a descriptive message and push to the remote repository.
