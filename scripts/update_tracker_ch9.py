import json

tracker_path = '/media/islamux/Variety/JavaScriptProjects/bassaer/project-tracker.json'

with open(tracker_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Add Chapter 9 Recovery to Backlog if not present
ch9_id = 'content_ch9_recovery'
exists = any(m['id'] == ch9_id for m in data['milestones']['backlog']) or \
         any(m['id'] == ch9_id for m in data['milestones']['active']) or \
         any(m['id'] == ch9_id for m in data['milestones']['completed'])

if not exists:
    data['milestones']['backlog'].append({
        "id": ch9_id,
        "title": "Chapter 9 Content & Structure Recovery",
        "domain": "Content",
        "week": 3,
        "phase": "recovery",
        "planned_start": "2026-05-05",
        "planned_end": "2026-05-12",
        "subtasks": [
            {
                "id": "ch9_001",
                "label": "Extract and clean Chapter 9 Sections (Sections 132-180+)",
                "status": "todo",
                "priority": "P1",
                "assignee": "arabic-specialist"
            }
        ]
    })

# Add history log for the documentation update
data['history_log'].append({
    "date": "2026-05-01",
    "event": "Updated tracker dashboard and added Chapter 9 to backlog.",
    "agent": "orchestrator"
})

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated tracker: Added Chapter 9 to backlog.")
