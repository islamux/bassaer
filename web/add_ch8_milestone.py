import json

tracker_path = '../project-tracker.json'

with open(tracker_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_milestone = {
    "id": "content_ch8_recovery",
    "title": "Chapter 8 Content & Structure Recovery",
    "domain": "Content",
    "week": 2,
    "phase": "recovery",
    "planned_start": "2026-05-01",
    "planned_end": "2026-05-02",
    "subtasks": [
        {
            "id": "ch8_001",
            "label": "Extract and clean Chapter 8 Section 1 (Question 127)",
            "status": "todo",
            "priority": "P1",
            "assignee": "arabic-specialist"
        },
        {
            "id": "ch8_002",
            "label": "Extract and clean Chapter 8 Section 2 (Question 128)",
            "status": "todo",
            "priority": "P1",
            "assignee": "arabic-specialist"
        },
        {
            "id": "ch8_003",
            "label": "Extract and clean Chapter 8 Section 3 (Question 129)",
            "status": "todo",
            "priority": "P1",
            "assignee": "arabic-specialist"
        },
        {
            "id": "ch8_004",
            "label": "Extract and clean Chapter 8 Section 4 (Question 130)",
            "status": "todo",
            "priority": "P1",
            "assignee": "arabic-specialist"
        },
        {
            "id": "ch8_005",
            "label": "Extract and clean Chapter 8 Section 5 (Question 131)",
            "status": "todo",
            "priority": "P1",
            "assignee": "arabic-specialist"
        }
    ]
}

data['milestones']['active'].append(new_milestone)

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Added Chapter 8 recovery to active milestones.")
