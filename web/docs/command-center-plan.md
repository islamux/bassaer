# Basaar (بصائر) Command Center — Adaptation Plan

> Adapted from `command-center-blueprint.md` for the Basaar Arabic Digital Book project.

---

## 1. Project Overview

**Basaar (بصائر)** converts a 900+ page Arabic PDF book into a modern, responsive, premium reading experience.

### Current State (as of 2026-04-26)

| Layer | Implementation |
|-------|-------------|
| Framework | Next.js 15 (App Router, RSC) |
| Content | 12 chapters + intro (Markdown via react-markdown) |
| Layout | RTL Arabic with Tajawal font, golden/brown palette |
| Modes | Dark/light theme, sidebar + mobile navigation |
| Generation | SSG for chapter pages |
| Processing | Python scripts for PDF extraction + text fixes |

### Pending Work

- `feat_search` — Full-text Arabic search
- `feat_bookmarks` — Bookmarks & highlights
- `feat_settings` — Font size, line spacing controls

---

## 2. Blueprint Adaptation Strategy

| Blueprint Aspect | Generic | Basaar Adaptation |
|---|---|---|
| Project name | "My Project" | "بصائر - Basaar Arabic Digital Book" |
| Domains | Hydrated later | Pre-defined: Content, UI/UX, Features, Scripts, Infrastructure |
| Phases | Generic | Content Quality, UI Polish, Feature Enhancement, Production |
| Start date | 2026-01-01 | 2026-04-22 |
| Target date | 2026-06-30 | 2026-07-01 |
| Agent roles | Generic 3 | + Arabic Content Specialist, Next.js Specialist |

### What Stays the Same

- All 24 MCP tools
- Tracker JSON schema
- Electron app architecture
- Task lifecycle state machine

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

| Milestone | Domain | Key? |
|---|---|---|
| `scripts_arabic_fix` | Scripts | No |
| `content_qa` | Content | No |
| `content_linguistic_recovery` | Content | **Yes: "Linguistic Integrity Verified"** |
| `content_proofread` | Content | No |
| `content_images` | Content | **Yes: "Content Complete"** |

### Phase 2: UI Polish (Weeks 2-5)

| Milestone | Domain | Key? |
|---|---|---|
| `ui_rtl_polish` | UI/UX | No |
| `ui_responsive` | UI/UX | No |
| `ui_themes` | UI/UX | No |
| `ui_a11y` | UI/UX | **Yes: "UI Production Ready"** |

### Phase 3: Feature Enhancement (Weeks 4-8)

| Milestone | Domain | Key? |
|---|---|---|
| `feat_search` | Features | No |
| `feat_progress` | Features | No |
| `feat_bookmarks` | Features | No |
| `feat_nav` | Features | No |
| `feat_settings` | Features | **Yes: "Features Complete"** |

### Phase 4: Production (Weeks 7-10)

| Milestone | Domain | Key? |
|---|---|---|
| `infra_perf` | Infrastructure | No |
| `infra_seo` | Infrastructure | No |
| `infra_deploy` | Infrastructure | No |
| `infra_launch` | Infrastructure | **Yes: "V1.0 Launch"** |

---

## 6. Implementation Status

### Phases 1-10 (Command Center Shell) — DONE

| Phase | Component | Location |
|---|---|---|
| PHASE 1 | Tracker Schema | `web/project-tracker.json` |
| PHASE 2 | MCP Server | `command-center-mcp/` |
| PHASE 3 | Electron Shell | `command-center/` |
| PHASE 4 | Store + Tab System | Zustand + TabBar + StatusBar |
| PHASE 9 | Design System | Tailwind CSS v4 + dark/light themes |
| PHASE 5 | Swim Lane View | `views/SwimLaneView.tsx` |
| PHASE 6 | Task Board View | `views/TaskBoardView.tsx` |
| PHASE 7 | Agent Hub View | `views/AgentHubView.tsx` |
| PHASE 8 | Calendar View | `views/CalendarView.tsx` |
| PHASE 10 | Workflow + Agents | `docs/workflow.md`, `docs/agent-roles.md` |

### Content Phase — DONE

| Task | Status | Notes |
|---|---|---|
| OCR Recovery (1370+ errors) | ✅ | `comprehensive_arabic_fix.py` + `arabic_recovery_pipeline.py` |
| Quranic Verse Restoration | ✅ | All chapters verified |
| Mobile Navigation | ✅ | `MobileMenu` drawer for RTL |
| Theme Refinements | ✅ | Dark/light + transitions |

### UI/UX Phase — DONE

| Task | Status | Notes |
|---|---|---|
| RTL Layout Polish | ✅ | Sidebar + typography |
| Mobile Responsive | ✅ | 320px+ support |
| Theme System | ✅ | Color palettes + smooth transitions |

---

## 7. Agent Roles

### Standard Agents

| Agent | Role | When Dispatched |
|---|---|---|
| `orchestrator` | Task coordination | All phases |
| `explorer` | Codebase investigation | Development tasks |
| `researcher` | Information gathering | Research tasks |
| `post-build-auditor` | Build verification | After code changes |

### Basaar-Specific Agents

| Agent | Role | When Dispatched |
|---|---|---|
| `arabic-specialist` | Arabic text quality | Content domain tasks |
| `nextjs-specialist` | Next.js best practices | Features & Infrastructure tasks |

### Arabic Content Specialist Responsibilities

- Review Arabic spelling, grammar, formatting
- Verify RTL markdown structure
- Check chapter titles and headings
- Validate blockquote styling
- Ensure consistent punctuation

### Next.js Specialist Responsibilities

- Verify App Router patterns (server/client components)
- Check static generation (SSG)
- Ensure image optimization via next/image
- Validate metadata API usage

---

## 8. Execution Order

1. Build Command Center skeleton (Phases 1-10) — DONE
2. Create workflow docs + agent definitions — DONE
3. Populate `project-tracker.json` with milestones — DONE
4. Register agents — DONE
5. Start working through milestones in week order

---

## 9. Summary

| Item | Value |
|---|---|
| Project | بصائر - Basaar Arabic Digital Book |
| Phases | 4 (Content Quality, UI Polish, Features, Production) |
| Domains | 5 (Content, UI/UX, Features, Scripts, Infrastructure) |
| Milestones | 16 |
| Key Milestones | 4 (Linguistic Integrity, Content Complete, UI Ready, V1.0 Launch) |
| Timeline | 10 weeks |
| Web Stack | Next.js 15 + React 19 + Tailwind CSS v4 + TypeScript |
| Agent Roles | 6 (standard 3 + Arabic Specialist + Next.js Specialist + Orchestrator) |
| Git Branch | `feature/arabic-linguistic-fix` |
| Build | ✅ All TypeScript passing |
| Components | 15 reusable UI components |
| Views | 4 main views (Swim Lane, Task Board, Agent Hub, Calendar) |

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
| `scripts/comprehensive_arabic_fix.py` | Main fix dictionary (620+ patterns) |
| `scripts/arabic_recovery_pipeline.py` | Additional cleanup |
| `scripts/audit_arabic_content.py` | Find issues in content |

### Why Python Scripts

- Systematic and reproducible
- All fixes centralized for future use
- Run on all files at once
- Easy to extend when new patterns discovered