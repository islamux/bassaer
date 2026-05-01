import json

tracker_path = '../project-tracker.json'

with open(tracker_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_milestone = {
    "id": "doc_agents_runbook",
    "title": "Project Documentation & Agent Runbook",
    "domain": "documentation",
    "week": "current",
    "phase": "operational",
    "planned_start": "2026-05-01",
    "planned_end": "2026-05-02",
    "subtasks": [
        {
            "id": "doc_001",
            "label": "Create AGENTS.md with Command Center CLI documentation and Agent Personas",
            "status": "todo",
            "priority": "P0",
            "assignee": "orchestrator",
            "notes": "HIGH PRIORITY: Define monorepo structure and pnpm cc commands."
        }
    ]
}

# Insert at the top of active milestones
data['milestones']['active'].insert(0, new_milestone)

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Added AGENTS.md task to project tracker.")
