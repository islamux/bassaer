# Basaar (بصائر) Command Center — Adaptation Plan

> Adapted from `command-center-blueprint.md` for the Basaar Arabic Digital Book project.
> **ALL PHASES 1-10 COMPLETED ✅. Ready for hydration and agent registration.**

---

## 1. Project Overview

### What is Basaar

Basaar (بصائر) is an Arabic digital book website that converts a 900+ page Arabic PDF book into a modern, responsive, premium reading experience.

**Current State:**
- Working Next.js 15 website (App Router) with 12 chapters + intro
- RTL Arabic layout with Tajawal font, golden/brown color palette
- Dark/light mode, sidebar navigation, top navbar
- Content as Markdown via `react-markdown`
- SSG for chapter pages
- Python scripts for PDF extraction and Arabic text processing

**Pending:**
- `fix-arabic-spelling-errors`
- Content quality improvements
- Feature additions (search, bookmarks, etc.)

### What the Command Center Will Do

Manage all future development of the Basaar web project via:
- **MCP Server** — 24 tools for AI agents to manage tasks
- **Electron Desktop App** — Visual dashboard with Swim Lane, Task Board, Agent Hub, Calendar

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

- All 24 MCP tools (no changes)
- Tracker JSON schema (no changes)
- Electron app architecture (no changes)
- Task lifecycle state machine (no changes)
- Design system for the Command Center itself

---

## 3. Stack Alignment

### Basaar Web App (Existing)

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

### Command Center (To Build — Separate App)

| Layer | Technology |
|---|---|
| Desktop App | Electron 41+ with electron-vite |
| UI Framework | React 19 |
| State Management | Zustand 5 |
| Styling | Tailwind CSS v4 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Fonts | Inter (UI) + JetBrains Mono (code) |
| MCP Server | Node.js + @modelcontextprotocol/sdk |
| Language | TypeScript |

The Command Center is a **separate application** from the Basaar web app. They share TypeScript and Tailwind knowledge but run independently.

---

## 4. Basaar-Specific Domains

### Domain 1: Content (محتوى) — `#f59e0b` (amber)

Arabic text quality, chapter formatting, proofreading, content processing.

### Domain 2: UI/UX (واجهة المستخدم) — `#22c55e` (green)

Visual design, layout, responsiveness, accessibility, reading experience.

### Domain 3: Features (ميزات) — `#8286FF` (indigo)

New functionality: search, bookmarks, reading progress, navigation enhancements.

### Domain 4: Scripts (أتمتة) — `#14B8A6` (teal)

Python/JS automation for content processing, Arabic proofreading scripts, CI/CD.

### Domain 5: Infrastructure (بنية تحتية) — `#6366F1` (violet)

Performance, deployment, SEO, error monitoring, analytics.

---

## 5. Phase & Milestone Definitions

### Phase 1: Content Quality (Weeks 1-3)

| Milestone ID | Title | Domain | Week | Key? |
|---|---|---|---|---|
| `content_qa` | Arabic Content QA | Content | 1 | No |
| `content_proofread` | Full Proofreading Pass | Content | 2 | No |
| `content_images` | Image Processing & Placement | Content | 3 | Yes: "Content Complete" |

### Phase 2: UI Polish (Weeks 2-5)

| Milestone ID | Title | Domain | Week | Key? |
|---|---|---|---|---|
| `ui_rtl_polish` | RTL Layout Polish | UI/UX | 2 | No |
| `ui_responsive` | Mobile Responsive Design | UI/UX | 3 | No |
| `ui_themes` | Theme System Refinement | UI/UX | 4 | No |
| `ui_a11y` | Accessibility Audit | UI/UX | 5 | Yes: "UI Production Ready" |

### Phase 3: Feature Enhancement (Weeks 4-8)

| Milestone ID | Title | Domain | Week | Key? |
|---|---|---|---|---|
| `feat_search` | Full-Text Search | Features | 4 | No |
| `feat_progress` | Reading Progress Tracking | Features | 5 | No |
| `feat_bookmarks` | Bookmarks & Highlights | Features | 6 | No |
| `feat_nav` | Enhanced Navigation | Features | 7 | No |
| `feat_settings` | Reading Settings | Features | 8 | Yes: "Features Complete" |

### Phase 4: Production (Weeks 7-10)

| Milestone ID | Title | Domain | Week | Key? |
|---|---|---|---|---|
| `infra_perf` | Performance Optimization | Infrastructure | 7 | No |
| `infra_seo` | SEO & Metadata | Infrastructure | 8 | No |
| `infra_deploy` | Deployment Setup | Infrastructure | 9 | No |
| `infra_launch` | Launch Preparation | Infrastructure | 10 | Yes: "V1.0 Launch" |

### Cross-cutting Milestones

| Milestone ID | Title | Domain | Week |
|---|---|---|---|
| `scripts_arabic_fix` | Arabic Fix Script Suite | Scripts | 1 |
| `scripts_ci` | CI/CD Pipeline | Scripts | 8 |

---

## 6. Tracker Configuration

```json
{
  "project": {
    "name": "بصائر - Basaar Arabic Digital Book",
    "start_date": "2026-04-22",
    "target_date": "2026-07-01",
    "current_week": 1,
    "schedule_status": "on_track",
    "overall_progress": 0
  },
  "milestones": [],
  "agents": [],
  "agent_log": [],
  "schedule": {
    "phases": [
      { "id": "content_quality", "title": "Content Quality", "start_week": 1, "end_week": 3 },
      { "id": "ui_polish", "title": "UI Polish", "start_week": 2, "end_week": 5 },
      { "id": "features", "title": "Feature Enhancement", "start_week": 4, "end_week": 8 },
      { "id": "production", "title": "Production", "start_week": 7, "end_week": 10 }
    ]
  }
}
```

---

## 7. Implementation Phases (From Blueprint)

Execute these phases in order. Each references the original blueprint with Basaar-specific notes.

### PHASE 1: TRACKER SCHEMA — DONE

> Completed 2026-04-22. `project-tracker.json` created at `web/` with Basaar config and 4 schedule phases.

### PHASE 2: MCP SERVER — DONE

> Completed 2026-04-22. Built at `command-center-mcp/` with all 24 tools + CLI. `npm run build` passes.

### PHASE 3: ELECTRON SHELL — DONE

> Completed 2026-04-22. Built at `command-center/` with electron-vite, file watcher, IPC handlers. `npm run build` passes.

### PHASE 4: STORE + TAB SYSTEM — DONE

> Completed 2026-04-22. Zustand store with selectors, write-back debounce, external listener. TabBar + StatusBar + theme toggle in App.tsx.

### PHASE 9: DESIGN SYSTEM — DONE

> Completed 2026-04-22. Tailwind CSS v4 theme with dark/light modes, color tokens, custom scrollbar, Inter + JetBrains Mono fonts.

---

### PHASE 5: SWIM LANE VIEW — DONE ✅

> Completed 2026-04-23. Built SVG-based Gantt-like swim lane timeline view with:
> - Week grid with headers and NOW marker
> - Domain-specific swim lanes with milestone nodes
> - Phase background bands and connection lines
> - Major milestone markers and detail panels
> - Auto-scroll to current week
>
> Files created:
> - `views/SwimLaneView.tsx` (main view)
> - `components/MilestoneNode.tsx` (SVG nodes)
> - `components/MilestoneDetailPanel.tsx` (480px slide-out)
> - `components/ProgressRing.tsx` (reusable component)
>
> Constants: WEEK_W=100, LANE_H=200, LABEL_W=140, NODE_R=20, KEY_NODE_R=26, PANEL_W=480

### PHASE 6: TASK BOARD VIEW — DONE ✅

> Completed 2026-04-23. Built Kanban board with:
> - 5 columns (TO DO, IN PROGRESS, REVIEW, DONE, BLOCKED)
> - Milestone navigation with progress rings
> - Task filtering (All, My Tasks, Agent Tasks, Blocked)
> - Drag-and-drop between columns with @dnd-kit
> - Task detail modal with comprehensive editing
>
> Files created:
> - `views/TaskBoardView.tsx` (main view)
> - `components/ContextBar.tsx` (milestone navigation)
> - `components/FilterBar.tsx` (filter controls)
> - `components/KanbanColumn.tsx` (individual columns)
> - `components/TaskCard.tsx` (draggable cards)
> - `components/TaskDetailModal.tsx` (full-screen editor)

### PHASE 7: AGENT HUB VIEW — DONE ✅

> Completed 2026-04-23. Built agent monitoring dashboard with:
> - Connected agents panel with hierarchical display
> - Activity feed with filtering and search
> - Agent performance metrics
> - Shared state file information
> - Context injection with copy-to-clipboard
> - Today's summary statistics
>
> Files created:
> - `views/AgentHubView.tsx` (main view)
> - `components/AgentCard.tsx` (agent display)
> - `components/ActivityFeed.tsx` (activity log)
> - `components/SharedStateInfo.tsx` (tracker info)
> - `components/ContextInjection.tsx` (context display)
> - `components/TodaysSummary.tsx` (daily stats)

### PHASE 8: CALENDAR VIEW — DONE ✅

> Completed 2026-04-23. Built weekly calendar with:
> - 7-column grid (Monday-Sunday)
> - Week navigation (Previous/Next/Today)
> - Task chips grouped by completion date
> - Today indicator and first-of-month highlighting
> - Empty state handling
>
> Files created:
> - `views/CalendarView.tsx` (main view)
> - `components/TaskChip.tsx` (task display)

### PHASE 10: WORKFLOW + AGENT ROLES — DONE

> Completed 2026-04-23. Created workflow docs (`docs/workflow.md`), agent role definitions (`docs/agent-roles.md`), and MCP config (`.mcp.json`).
> Reference: `docs/command-center-blueprint.md` lines 1991-2216
> Plus the Basaar-specific agent roles from Section 9 below.

### HYDRATE

> After all 10 phases complete, populate `project-tracker.json` with the milestones and tasks from Section 8 below.
> Then register 6 agents: `orchestrator`, `explorer`, `researcher`, `post-build-auditor`, `arabic-specialist`, `nextjs-specialist`.

---

## 8. Hydration Data (Pre-populated Milestones & Tasks)

After the Command Center skeleton is built, populate via MCP tools.

### `scripts_arabic_fix` (Week 1, Scripts)

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `scripts_arabic_fix_001` | Consolidate Arabic fix scripts into a single pipeline | P1 | agent |
| `scripts_arabic_fix_002` | Fix known Arabic spelling errors across all chapters | P1 | agent |
| `scripts_arabic_fix_003` | Validate all chapter markdown files render correctly | P2 | agent |

### `content_qa` (Week 1, Content)

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `content_qa_001` | Audit all 12 chapters for Arabic text corruption | P1 | agent |
| `content_qa_002` | Verify chapter titles match PDF source | P2 | agent |
| `content_qa_003` | Check image references and alt text | P2 | agent |

### `content_proofread` (Week 2, Content)

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `content_proofread_001` | Proofread chapters 1-4 | P1 | agent |
| `content_proofread_002` | Proofread chapters 5-8 | P1 | agent |
| `content_proofread_003` | Proofread chapters 9-12 + intro | P1 | agent |
| `content_proofread_004` | Verify blockquote formatting across all chapters | P2 | agent |

### `content_images` (Week 3, Content) — KEY

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `content_images_001` | Optimize all images (WebP conversion, sizing) | P2 | agent |
| `content_images_002` | Add proper alt text in Arabic for all images | P2 | agent |
| `content_images_003` | Verify image layout in RTL context | P2 | pair |

### `ui_rtl_polish` (Week 2, UI/UX)

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `ui_rtl_polish_001` | Audit RTL layout issues across all pages | P1 | agent |
| `ui_rtl_polish_002` | Fix sidebar RTL behavior on mobile | P2 | agent |
| `ui_rtl_polish_003` | Improve Arabic typography spacing and line height | P2 | pair |

### `ui_responsive` (Week 3, UI/UX)

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `ui_responsive_001` | Test and fix mobile layout (320px-768px) | P1 | agent |
| `ui_responsive_002` | Test and fix tablet layout (768px-1024px) | P2 | agent |
| `ui_responsive_003` | Add touch-friendly navigation for mobile | P2 | agent |

### `ui_themes` (Week 4, UI/UX)

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `ui_themes_001` | Refine dark mode color palette | P2 | pair |
| `ui_themes_002` | Add smooth theme transition animation | P3 | agent |
| `ui_themes_003` | Test theme consistency across all chapter pages | P2 | agent |

### `ui_a11y` (Week 5, UI/UX) — KEY

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `ui_a11y_001` | Run accessibility audit (Lighthouse) and fix critical issues | P1 | agent |
| `ui_a11y_002` | Add ARIA labels for navigation components | P2 | agent |
| `ui_a11y_003` | Ensure keyboard navigation works end-to-end | P2 | agent |
| `ui_a11y_004` | Test with screen reader (Arabic VoiceOver) | P2 | human |

### `feat_search` (Week 4, Features)

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `feat_search_001` | Research search solutions for static Next.js (flexsearch, pagefind) | P1 | agent |
| `feat_search_002` | Implement full-text Arabic search | P1 | agent |
| `feat_search_003` | Add search UI component with RTL support | P2 | agent |

### `feat_progress` (Week 5, Features)

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `feat_progress_001` | Design reading progress tracking (localStorage) | P2 | agent |
| `feat_progress_002` | Implement progress bar and chapter completion tracking | P2 | agent |
| `feat_progress_003` | Add "Continue Reading" feature on home page | P3 | agent |

### `feat_bookmarks` (Week 6, Features)

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `feat_bookmarks_001` | Implement bookmark storage (localStorage) | P2 | agent |
| `feat_bookmarks_002` | Add bookmark UI (sidebar panel + in-page markers) | P2 | agent |
| `feat_bookmarks_003` | Add highlight/annotation support for selected text | P3 | agent |

### `feat_nav` (Week 7, Features)

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `feat_nav_001` | Improve table of contents with collapsible sections | P2 | agent |
| `feat_nav_002` | Add previous/next chapter navigation | P2 | agent |
| `feat_nav_003` | Add breadcrumb navigation | P3 | agent |

### `feat_settings` (Week 8, Features) — KEY

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `feat_settings_001` | Add font size control (small/medium/large) | P2 | agent |
| `feat_settings_002` | Add line spacing control | P3 | agent |
| `feat_settings_003` | Add reading width control | P3 | agent |

### `infra_perf` (Week 7, Infrastructure)

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `infra_perf_001` | Run Lighthouse audit and fix performance issues | P1 | agent |
| `infra_perf_002` | Optimize image loading (lazy load, blur placeholder) | P2 | agent |
| `infra_perf_003` | Implement ISR or static regeneration strategy | P2 | agent |

### `infra_seo` (Week 8, Infrastructure)

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `infra_seo_001` | Add proper meta tags for all chapters (Arabic SEO) | P1 | agent |
| `infra_seo_002` | Generate sitemap.xml | P2 | agent |
| `infra_seo_003` | Add Open Graph and Twitter card meta | P2 | agent |
| `infra_seo_004` | Add structured data (JSON-LD) for book chapters | P3 | agent |

### `infra_deploy` (Week 9, Infrastructure)

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `infra_deploy_001` | Set up Vercel deployment (or alternative) | P1 | agent |
| `infra_deploy_002` | Configure custom domain | P2 | human |
| `infra_deploy_003` | Add error monitoring (Sentry or similar) | P2 | agent |
| `infra_deploy_004` | Add analytics (privacy-respecting) | P3 | agent |

### `infra_launch` (Week 10, Infrastructure) — KEY

| Task ID | Label | Priority | Mode |
|---|---|---|---|
| `infra_launch_001` | Final QA pass across all pages and features | P1 | pair |
| `infra_launch_002` | Cross-browser testing (Chrome, Firefox, Safari, Edge) | P1 | agent |
| `infra_launch_003` | Mobile device testing | P1 | human |
| `infra_launch_004` | Launch | P1 | human |

---

## 9. Basaar-Specific Agent Roles

In addition to the standard Explorer, Researcher, and Post-Build Auditor:

### Arabic Content Specialist

**Role:** Arabic text quality reviewer. Checks spelling, grammar, formatting, RTL issues.

**When dispatched:** During Content domain tasks.

**Responsibilities:**
- Review Arabic text for spelling and grammar errors
- Verify markdown formatting for RTL context
- Check chapter titles and headings formatting
- Validate blockquote styling and emphasis markers
- Ensure consistent punctuation and spacing

**Must call:** `log_action(task_id, "arabic_review_complete", description, agent_id: "arabic-specialist")`

### Next.js Specialist

**Role:** Next.js App Router expert. Ensures implementation follows Next.js best practices.

**When dispatched:** During Features and Infrastructure tasks.

**Responsibilities:**
- Verify App Router patterns (server/client components)
- Check static generation (SSG) works correctly
- Ensure image optimization via next/image
- Validate metadata API usage
- Check data fetching patterns

**Must call:** `log_action(task_id, "nextjs_review_complete", description, agent_id: "nextjs-specialist")`

---

## 10. MCP Configuration for Basaar

```json
{
  "command-center": {
    "command": "command-center-mcp",
    "env": {
      "PROJECT_ROOT": "/media/islamux/Variety/JavaScriptProjects/bassaer-antigravity/web"
    }
  }
}
```

---

## 11. Execution Order

✅ Build the Command Center skeleton following blueprint Phases 1-10
✅ Create workflow documentation and agent role definitions
✅ Add, commit, and push all Command Center files to git
2. Hydrate with the Basaar milestones and tasks from Section 8
3. Register agents: `orchestrator`, `explorer`, `researcher`, `post-build-auditor`, `arabic-specialist`, `nextjs-specialist`
4. Start working through milestones in week order

---

## 12. Summary

| Item | Value |
|---|---|
| Project | بصائر - Basaar Arabic Digital Book |
| Phases | 4 (Content Quality, UI Polish, Features, Production) |
| Domains | 5 (Content, UI/UX, Features, Scripts, Infrastructure) |
| Milestones | 16 |
| Key Milestones | 4 (Content Complete, UI Production Ready, Features Complete, V1.0 Launch) |
| Total Tasks | ~50 |
| Timeline | 10 weeks |
| Web Stack | Next.js 15 + React 19 + Tailwind CSS v4 + TypeScript |
| Agent Roles | 6 (standard 3 + Arabic Specialist + Next.js Specialist + Orchestrator) |
| Implementation Status | ✅ Phases 1-10 Complete + Deep Linguistic Audit Started |
| Git Status | ✅ Force-pushed clean history to feature/arabic-linguistic-fix |
| Build Status | ✅ All TypeScript compilation passing |
| Components | 15 reusable UI components (added MobileMenu) |
| Views | 4 main views (Swim Lane, Task Board, Agent Hub, Calendar) |

### Recent Adjustments (April 25, 2026)
- **Arabic Text Recovery:** Consolidated multiple fix scripts into `fix_arabic_comprehensive_v3.py`. Resolved widespread corruption (broken 'Ya', honorifics, presentation forms).
- **Mobile Navigation:** Implemented `MobileMenu` drawer to solve RTL navigation issues on small screens.
- **Intro Content Recovery:** Successfully recovered missing content in `intro.md` from PDF source.
- **Linguistic Quality:** Initiated a manual-refinement and deep audit pass starting from the Introduction to catch remaining OCR artifacts.
