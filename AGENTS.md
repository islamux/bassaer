# Basaar Command Center: Agent Runbook & CLI Guide

Welcome to the **Basaar Command Center**. This document is the single source of truth for AI agents and human developers working on the Basaar project. It defines the workspace architecture, the operational CLI commands, and the specific roles of our registered AI agents.

---

## 🏗️ Workspace Architecture (Monorepo)

The project has been restructured into a monorepo to safely orchestrate multiple sub-projects from a single root directory.

* **`/` (Root):** Contains the orchestration configuration (`package.json`, `pnpm-workspace.yaml`), the central `project-tracker.json`, and this runbook.
* **`/web`**: The main Next.js web application. Contains `app/`, `components/`, `lib/`, `docs/`, and `supabase/migrations/`.
* **`/scripts`**: Python utility scripts (e.g., `cc-dash.py` for terminal UI dashboards, OCR fix scripts).

> **CRITICAL RULE:** All Command Center CLI commands **must** be executed from the **root directory** (`/media/islamux/Variety/JavaScriptProjects/bassaer/`). Do not run them from within `/web`.

---

## 🛠️ Command Center CLI (`pnpm cc`)

The Command Center provides a set of centralized scripts defined in the root `package.json` for managing the project lifecycle, viewing tasks, and controlling sub-applications.

> **CRITICAL:** All `pnpm cc:*` commands must be run from the **root directory**. Do not run them from `/web`.

See [docs/cc-commands.md](docs/cc-commands.md) for the full command reference with syntax, flags, and examples.

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

---

## 🌿 GitHub Flow

1. **Add** — `git add <files>`
2. **Commit** — `git commit -m "<descriptive message>"`
3. **Push** — `git push -u origin <branch>`
4. **PR** — create pull request via GitHub CLI or web
5. **Accept PR** — merge to `main` via GitHub UI
6. **Keep branch** — do **not** delete the remote branch after merging
7. **Update local main** — `git checkout main && git pull origin main`
