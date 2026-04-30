# Basaar (بصائر) Command Center — Adaptation Plan

> Adapted from `command-center-blueprint.md` for the Basaar Arabic Digital Book project.

---

## 1. Project Overview

**Basaar (بصائر)** converts a 900+ page Arabic PDF book into a modern, responsive, premium reading experience.

### Current State (as of 2026-04-30)

| Layer | Implementation |
|-------|-------------|
| Framework | Next.js 15 (App Router, RSC) |
| Content | 12 chapters + intro (Markdown via react-markdown) |
| Layout | RTL Arabic with Tajawal font, golden/brown palette |
| Progress | **65% Complete** (all 13 chapters structurally verified) |
| Current Focus | Chapter 7 Content Recovery & PDF Re-extraction |
| Processing | Python scripts for PDF extraction + text fixes (1500+ fixes) |

### Pending Work

- `feat_search` — Full-text Arabic search (Active)
- `feat_bookmarks` — Bookmarks & highlights
- `feat_settings` — Font size, line spacing controls
- `content_ch7_recovery` — Direct PDF extraction for missing segments

---

## 2. Blueprint Adaptation Strategy

| Blueprint Aspect | Generic | Basaar Adaptation |
|---|---|---|
| Project name | "My Project" | "بصائر - Basaar Arabic Digital Book" |
| Domains | Hydrated later | Pre-defined: Content, UI/UX, Features, Scripts, Infrastructure |
| Phases | Generic | Content Quality, UI Polish, Feature Enhancement, Production |
| Start date | 2026-01-01 | 2026-04-22 |
| Target date | 2026-06-30 | 2026-07-01 |
| Agent roles | Standard 3 | + Arabic Content Specialist, Next.js Specialist |

### What Stays the Same

- All 24 MCP tools (8 Read, 9 Lifecycle, 1 Enrichment, 5 Milestone, 1 Agent)
- Tracker JSON schema (TrackerState, Milestone, Subtask, Agent, AgentLogEntry)
- Electron app architecture (Zustand + React 19 + Tailwind CSS v4)
- Task lifecycle state machine (TODO -> IN PROGRESS -> REVIEW -> DONE)

---

## 3. Stack Alignment

### Basaar Web App

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| UI | React 19 |
| Styling | Tailwind CSS v4 + custom Arabic theme |
| Content | react-markdown + remark-gfm |
| Icons | lucide-react |
| Font | Tajawal (Arabic) via next/font/google |
| Language | TypeScript |
| Package Manager | pnpm |

### Command Center (Separate App)

| Layer | Technology |
|---|---|
| Desktop App | Electron 41+ with electron-vite |
| UI Framework | React 19 |
| State Management | Zustand 5 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Fonts | Inter (UI) + JetBrains Mono (code) |
| MCP Server | Node.js + @modelcontextprotocol/sdk |

---

## 4. Domains

| Domain | Color | Focus |
|--------|-------|-------|
| **Content** (محتوى) | amber | Arabic text quality, chapter formatting, proofreading |
| **UI/UX** (واجهة المستخدم) | green | Visual design, RTL, responsiveness, accessibility |
| **Features** (ميزات) | indigo | Search, bookmarks, reading progress, navigation |
| **Scripts** (أتمتة) | teal | Python/JS automation for content processing |
| **Infrastructure** (بنية تحتية) | violet | Performance, deployment, SEO, analytics |

---

## 5. Phase & Milestone Overview

### Phase 1: Content Quality (Weeks 1-3)

| Milestone | Domain | Key? | Status |
|---|---|---|---|
| `scripts_arabic_fix` | Scripts | No | ✅ |
| `content_qa` | Content | No | ✅ |
| `content_linguistic_recovery` | Content | **Yes: "Linguistic Integrity Verified"** | ✅ |
| `content_ocr_chapters` | Content | No | ✅ (1500+ fixes) |
| `content_ch7_recovery` | Content | No | 🏗️ (Current Focus) |
| `content_images` | Content | **Yes: "Content Complete"** | 📅 |

### Phase 2: UI Polish (Weeks 2-5)

| Milestone | Domain | Key? | Status |
|---|---|---|---|
| `ui_rtl_polish` | UI/UX | No | ✅ |
| `ui_responsive` | UI/UX | No | ✅ |
| `ui_themes` | UI/UX | No | ✅ |
| `ui_a11y` | UI/UX | **Yes: "UI Production Ready"** | ✅ |

### Phase 3: Feature Enhancement (Weeks 4-8)

| Milestone | Domain | Key? | Status |
|---|---|---|---|
| `feat_search` | Features | No | 🏗️ |
| `feat_progress` | Features | No | 📅 |
| `feat_bookmarks` | Features | No | 📅 |
| `feat_nav` | Features | No | 📅 |
| `feat_settings` | Features | **Yes: "Features Complete"** | 📅 |

### Phase 4: Production (Weeks 7-10)

| Milestone | Domain | Key? | Status |
|---|---|---|---|
| `infra_perf` | Infrastructure | No | 📅 |
| `infra_seo` | Infrastructure | No | 📅 |
| `infra_deploy` | Infrastructure | No | 📅 |
| `infra_launch` | Infrastructure | **Yes: "V1.0 Launch"** | 📅 |

---

## 6. Implementation Status

### Phases 1-10 (Command Center Shell) — DONE

| Phase | Component | Location | Status |
|---|---|---|---|
| PHASE 1 | Tracker Schema | `web/project-tracker.json` | ✅ |
| PHASE 2 | MCP Server | `command-center-mcp/` | ✅ |
| PHASE 3 | Electron Shell | `command-center/` | ✅ |
| PHASE 4 | Store + Tab System | Zustand + TabBar + StatusBar | ✅ |
| PHASE 9 | Design System | Tailwind CSS v4 + dark/light themes | ✅ |
| PHASE 5-8 | All 4 Views | Swim Lane, Task Board, Agent Hub, Calendar | ✅ |
| PHASE 10 | Workflow + Agents | `docs/workflow.md`, `docs/agent-roles.md` | ✅ |

### Content & Recovery Phase — 65% PROGRESS

| Task | Status | Notes |
|---|---|---|
| Massive OCR Sweep | ✅ | Fixed ~1500 corruptions across all 13 chapters. |
| Chapter 3 Recovery | ✅ | Systematic 'Ya' suffixes and broken verses fixed. |
| Quranic Verse Restoration | ✅ | All chapters verified against original source. |
| Chapter 7 Recovery | 🏗️ | Focus on missing sections 1-4 from source PDF. |

### UI/UX Phase — DONE

| Task | Status | Notes |
|---|---|---|
| RTL Layout Polish | ✅ | Sidebar + typography (Tajawal font). |
| Mobile Responsive | ✅ | Verified down to 320px. |
| Accessibility | ✅ | ARIA roles, keyboard nav, and production themes. |

---

## 7. Agent Roles (Blueprint Sync)

### Core Task Agents

| Agent | Role | Responsibility |
|---|---|---|
| `orchestrator` | Task coordination | High-level planning, task creation, and dispatch. |
| `explorer` | Codebase investigator | Dispatched during **Prepare** phase to map dependencies. |
| `researcher` | Info gathering | Dispatched during **Prepare** phase to look up documentation. |
| `post-build-auditor`| Quality gate | Dispatched after **Implementation** for build/lint/security checks. |

### Basaar-Specific Specialists

| Agent | Role | Responsibility |
|---|---|---|
| `arabic-specialist` | Linguistic expert | Reviews Arabic spelling, grammar, and RTL formatting. |
| `nextjs-specialist` | Next.js expert | Ensures App Router best practices and SSG optimization. |

---

## 8. Task Workflow State Machine

Agents MUST follow this lifecycle defined in the blueprint:

1. **PREPARE (Task in TODO)**
   - `get_task_context` -> `explorer` investigation -> `researcher` lookup.
   - Result: Task enriched with `acceptance_criteria`, `constraints`, and `builder_prompt`.

2. **START (Task in IN_PROGRESS)**
   - `start_task` -> Implementation -> Build/Typecheck/Lint.
   - `post-build-auditor` pass -> `complete_task` (moves to REVIEW).

3. **REVIEW**
   - Operator approves (`approve_task` -> DONE) or rejects (`reject_task` -> IN_PROGRESS).
   - Auto-unblock cascade runs on approval for downstream dependencies.

---

## 9. Summary

| Item | Value |
|---|---|
| Project | بصائر - Basaar Arabic Digital Book |
| Progress | **65% Overall** |
| Milestones | 16 (6 Active/Backlog, 10 Completed) |
| Key Milestones | 4 (Linguistic Integrity, Content Complete, UI Ready, V1.0 Launch) |
| Timeline | 10 weeks (Started April 22) |
| Build | ✅ All TypeScript/Next.js passing |

---

## 10. OCR Fix Workflow (MANDATORY)

**⚠️ CRITICAL: Always use Python scripts in `/scripts/` for OCR fixes. NEVER use manual sed/bash commands.**

### Workflow

```
1. Discover OCR issue → Note the pattern (e.g., 'الثابن' → 'الثاني')
2. Add to Python script → Edit scripts/comprehensive_arabic_fix.py
3. Run the fix script → python3 scripts/comprehensive_arabic_fix.py
4. Run recovery pipeline → python3 scripts/arabic_recovery_pipeline.py
5. Verify → Check output and re-run if needed
```

### Key Scripts

| Script | Purpose |
|--------|---------|
| `scripts/comprehensive_arabic_fix.py` | Main fix dictionary (700+ patterns) |
| `scripts/arabic_recovery_pipeline.py` | Additional cleanup |
| `scripts/audit_arabic_content.py` | Find issues in content |