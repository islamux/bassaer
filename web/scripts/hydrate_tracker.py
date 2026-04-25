import json
import os
from datetime import datetime

tracker_path = 'project-tracker.json'

data = {
    "project": {
        "name": "بصائر - Basaar Arabic Digital Book",
        "start_date": "2026-04-22",
        "target_date": "2026-07-01",
        "current_week": 1,
        "schedule_status": "on_track",
        "overall_progress": 0
    },
    "milestones": [
        {
            "id": "scripts_arabic_fix",
            "title": "Arabic Fix Script Suite",
            "domain": "Scripts",
            "week": 1,
            "phase": "content_quality",
            "planned_start": "2026-04-22",
            "planned_end": "2026-04-28",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": False,
            "key_milestone_label": None,
            "subtasks": [
                {"id": "scripts_arabic_fix_001", "label": "Consolidate Arabic fix scripts into a single pipeline", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "scripts_arabic_fix_002", "label": "Fix known Arabic spelling errors across all chapters", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "scripts_arabic_fix_003", "label": "Validate all chapter markdown files render correctly", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"}
            ],
            "dependencies": [],
            "notes": []
        },
        {
            "id": "content_qa",
            "title": "Arabic Content QA",
            "domain": "Content",
            "week": 1,
            "phase": "content_quality",
            "planned_start": "2026-04-22",
            "planned_end": "2026-04-28",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": False,
            "key_milestone_label": None,
            "subtasks": [
                {"id": "content_qa_001", "label": "Audit all 12 chapters for Arabic text corruption", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "content_qa_002", "label": "Verify chapter titles match PDF source", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "content_qa_003", "label": "Check image references and alt text", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"}
            ],
            "dependencies": [],
            "notes": []
        },
        {
            "id": "content_proofread",
            "title": "Full Proofreading Pass",
            "domain": "Content",
            "week": 2,
            "phase": "content_quality",
            "planned_start": "2026-04-29",
            "planned_end": "2026-05-05",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": False,
            "key_milestone_label": None,
            "subtasks": [
                {"id": "content_proofread_001", "label": "Proofread chapters 1-4", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "content_proofread_002", "label": "Proofread chapters 5-8", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "content_proofread_003", "label": "Proofread chapters 9-12 + intro", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "content_proofread_004", "label": "Verify blockquote formatting across all chapters", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"}
            ],
            "dependencies": [],
            "notes": []
        },
        {
            "id": "content_images",
            "title": "Image Processing & Placement",
            "domain": "Content",
            "week": 3,
            "phase": "content_quality",
            "planned_start": "2026-05-06",
            "planned_end": "2026-05-12",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": True,
            "key_milestone_label": "Content Complete",
            "subtasks": [
                {"id": "content_images_001", "label": "Optimize all images (WebP conversion, sizing)", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "content_images_002", "label": "Add proper alt text in Arabic for all images", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "content_images_003", "label": "Verify image layout in RTL context", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "pair"}
            ],
            "dependencies": ["content_proofread"],
            "notes": []
        },
        {
            "id": "ui_rtl_polish",
            "title": "RTL Layout Polish",
            "domain": "UI/UX",
            "week": 2,
            "phase": "ui_polish",
            "planned_start": "2026-04-29",
            "planned_end": "2026-05-05",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": False,
            "key_milestone_label": None,
            "subtasks": [
                {"id": "ui_rtl_polish_001", "label": "Audit RTL layout issues across all pages", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "ui_rtl_polish_002", "label": "Fix sidebar RTL behavior on mobile", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "ui_rtl_polish_003", "label": "Improve Arabic typography spacing and line height", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "pair"}
            ],
            "dependencies": [],
            "notes": []
        },
        {
            "id": "ui_responsive",
            "title": "Mobile Responsive Design",
            "domain": "UI/UX",
            "week": 3,
            "phase": "ui_polish",
            "planned_start": "2026-05-06",
            "planned_end": "2026-05-12",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": False,
            "key_milestone_label": None,
            "subtasks": [
                {"id": "ui_responsive_001", "label": "Test and fix mobile layout (320px-768px)", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "ui_responsive_002", "label": "Test and fix tablet layout (768px-1024px)", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "ui_responsive_003", "label": "Add touch-friendly navigation for mobile", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"}
            ],
            "dependencies": ["ui_rtl_polish"],
            "notes": []
        },
        {
            "id": "ui_themes",
            "title": "Theme System Refinement",
            "domain": "UI/UX",
            "week": 4,
            "phase": "ui_polish",
            "planned_start": "2026-05-13",
            "planned_end": "2026-05-19",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": False,
            "key_milestone_label": None,
            "subtasks": [
                {"id": "ui_themes_001", "label": "Refine dark mode color palette", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "pair"},
                {"id": "ui_themes_002", "label": "Add smooth theme transition animation", "status": "todo", "done": False, "assignee": None, "priority": "P3", "execution_mode": "agent"},
                {"id": "ui_themes_003", "label": "Test theme consistency across all chapter pages", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"}
            ],
            "dependencies": [],
            "notes": []
        },
        {
            "id": "ui_a11y",
            "title": "Accessibility Audit",
            "domain": "UI/UX",
            "week": 5,
            "phase": "ui_polish",
            "planned_start": "2026-05-20",
            "planned_end": "2026-05-26",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": True,
            "key_milestone_label": "UI Production Ready",
            "subtasks": [
                {"id": "ui_a11y_001", "label": "Run accessibility audit (Lighthouse) and fix critical issues", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "ui_a11y_002", "label": "Add ARIA labels for navigation components", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "ui_a11y_003", "label": "Ensure keyboard navigation works end-to-end", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "ui_a11y_004", "label": "Test with screen reader (Arabic VoiceOver)", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "human"}
            ],
            "dependencies": ["ui_responsive"],
            "notes": []
        },
        {
            "id": "feat_search",
            "title": "Full-Text Search",
            "domain": "Features",
            "week": 4,
            "phase": "features",
            "planned_start": "2026-05-13",
            "planned_end": "2026-05-19",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": False,
            "key_milestone_label": None,
            "subtasks": [
                {"id": "feat_search_001", "label": "Research search solutions for static Next.js (flexsearch, pagefind)", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "feat_search_002", "label": "Implement full-text Arabic search", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "feat_search_003", "label": "Add search UI component with RTL support", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"}
            ],
            "dependencies": [],
            "notes": []
        },
        {
            "id": "feat_progress",
            "title": "Reading Progress Tracking",
            "domain": "Features",
            "week": 5,
            "phase": "features",
            "planned_start": "2026-05-20",
            "planned_end": "2026-05-26",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": False,
            "key_milestone_label": None,
            "subtasks": [
                {"id": "feat_progress_001", "label": "Design reading progress tracking (localStorage)", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "feat_progress_002", "label": "Implement progress bar and chapter completion tracking", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "feat_progress_003", "label": "Add \"Continue Reading\" feature on home page", "status": "todo", "done": False, "assignee": None, "priority": "P3", "execution_mode": "agent"}
            ],
            "dependencies": [],
            "notes": []
        },
        {
            "id": "feat_bookmarks",
            "title": "Bookmarks & Highlights",
            "domain": "Features",
            "week": 6,
            "phase": "features",
            "planned_start": "2026-05-27",
            "planned_end": "2026-06-02",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": False,
            "key_milestone_label": None,
            "subtasks": [
                {"id": "feat_bookmarks_001", "label": "Implement bookmark storage (localStorage)", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "feat_bookmarks_002", "label": "Add bookmark UI (sidebar panel + in-page markers)", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "feat_bookmarks_003", "label": "Add highlight/annotation support for selected text", "status": "todo", "done": False, "assignee": None, "priority": "P3", "execution_mode": "agent"}
            ],
            "dependencies": [],
            "notes": []
        },
        {
            "id": "feat_nav",
            "title": "Enhanced Navigation",
            "domain": "Features",
            "week": 7,
            "phase": "features",
            "planned_start": "2026-06-03",
            "planned_end": "2026-06-09",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": False,
            "key_milestone_label": None,
            "subtasks": [
                {"id": "feat_nav_001", "label": "Improve table of contents with collapsible sections", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "feat_nav_002", "label": "Add previous/next chapter navigation", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "feat_nav_003", "label": "Add breadcrumb navigation", "status": "todo", "done": False, "assignee": None, "priority": "P3", "execution_mode": "agent"}
            ],
            "dependencies": [],
            "notes": []
        },
        {
            "id": "feat_settings",
            "title": "Reading Settings",
            "domain": "Features",
            "week": 8,
            "phase": "features",
            "planned_start": "2026-06-10",
            "planned_end": "2026-06-16",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": True,
            "key_milestone_label": "Features Complete",
            "subtasks": [
                {"id": "feat_settings_001", "label": "Add font size control (small/medium/large)", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "feat_settings_002", "label": "Add line spacing control", "status": "todo", "done": False, "assignee": None, "priority": "P3", "execution_mode": "agent"},
                {"id": "feat_settings_003", "label": "Add reading width control", "status": "todo", "done": False, "assignee": None, "priority": "P3", "execution_mode": "agent"}
            ],
            "dependencies": [],
            "notes": []
        },
        {
            "id": "infra_perf",
            "title": "Performance Optimization",
            "domain": "Infrastructure",
            "week": 7,
            "phase": "production",
            "planned_start": "2026-06-03",
            "planned_end": "2026-06-09",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": False,
            "key_milestone_label": None,
            "subtasks": [
                {"id": "infra_perf_001", "label": "Run Lighthouse audit and fix performance issues", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "infra_perf_002", "label": "Optimize image loading (lazy load, blur placeholder)", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "infra_perf_003", "label": "Implement ISR or static regeneration strategy", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"}
            ],
            "dependencies": [],
            "notes": []
        },
        {
            "id": "infra_seo",
            "title": "SEO & Metadata",
            "domain": "Infrastructure",
            "week": 8,
            "phase": "production",
            "planned_start": "2026-06-10",
            "planned_end": "2026-06-16",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": False,
            "key_milestone_label": None,
            "subtasks": [
                {"id": "infra_seo_001", "label": "Add proper meta tags for all chapters (Arabic SEO)", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "infra_seo_002", "label": "Generate sitemap.xml", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "infra_seo_003", "label": "Add Open Graph and Twitter card meta", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "infra_seo_004", "label": "Add structured data (JSON-LD) for book chapters", "status": "todo", "done": False, "assignee": None, "priority": "P3", "execution_mode": "agent"}
            ],
            "dependencies": [],
            "notes": []
        },
        {
            "id": "infra_deploy",
            "title": "Deployment Setup",
            "domain": "Infrastructure",
            "week": 9,
            "phase": "production",
            "planned_start": "2026-06-17",
            "planned_end": "2026-06-23",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": False,
            "key_milestone_label": None,
            "subtasks": [
                {"id": "infra_deploy_001", "label": "Set up Vercel deployment (or alternative)", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "infra_deploy_002", "label": "Configure custom domain", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "human"},
                {"id": "infra_deploy_003", "label": "Add error monitoring (Sentry or similar)", "status": "todo", "done": False, "assignee": None, "priority": "P2", "execution_mode": "agent"},
                {"id": "infra_deploy_004", "label": "Add analytics (privacy-respecting)", "status": "todo", "done": False, "assignee": None, "priority": "P3", "execution_mode": "agent"}
            ],
            "dependencies": [],
            "notes": []
        },
        {
            "id": "infra_launch",
            "title": "Launch Preparation",
            "domain": "Infrastructure",
            "week": 10,
            "phase": "production",
            "planned_start": "2026-06-24",
            "planned_end": "2026-07-01",
            "actual_start": None,
            "actual_end": None,
            "drift_days": 0,
            "is_key_milestone": True,
            "key_milestone_label": "V1.0 Launch",
            "subtasks": [
                {"id": "infra_launch_001", "label": "Final QA pass across all pages and features", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "pair"},
                {"id": "infra_launch_002", "label": "Cross-browser testing (Chrome, Firefox, Safari, Edge)", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "agent"},
                {"id": "infra_launch_003", "label": "Mobile device testing", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "human"},
                {"id": "infra_launch_004", "label": "Launch", "status": "todo", "done": False, "assignee": None, "priority": "P1", "execution_mode": "human"}
            ],
            "dependencies": ["infra_deploy"],
            "notes": []
        }
    ],
    "agents": [
        {"id": "orchestrator", "name": "Orchestrator", "type": "orchestrator", "color": "#8286FF", "status": "idle", "permissions": ["read", "write"], "last_action_at": None, "session_action_count": 0},
        {"id": "explorer", "name": "Explorer", "type": "sub-agent", "color": "#14B8A6", "status": "idle", "permissions": ["read"], "last_action_at": None, "session_action_count": 0},
        {"id": "researcher", "name": "Researcher", "type": "sub-agent", "color": "#22C55E", "status": "idle", "permissions": ["read"], "last_action_at": None, "session_action_count": 0},
        {"id": "post-build-auditor", "name": "Post-Build Auditor", "type": "sub-agent", "color": "#F59E0B", "status": "idle", "permissions": ["read"], "last_action_at": None, "session_action_count": 0},
        {"id": "arabic-specialist", "name": "Arabic Content Specialist", "type": "sub-agent", "color": "#F59E0B", "status": "idle", "permissions": ["read", "write"], "last_action_at": None, "session_action_count": 0},
        {"id": "nextjs-specialist", "name": "Next.js Specialist", "type": "sub-agent", "color": "#6366F1", "status": "idle", "permissions": ["read", "write"], "last_action_at": None, "session_action_count": 0}
    ],
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

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Tracker hydrated at {tracker_path}")
