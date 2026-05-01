import json

tracker_path = '../project-tracker.json'

with open(tracker_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for milestone in data['milestones']['active']:
    if milestone['id'] == 'content_ch8_recovery':
        for task in milestone['subtasks']:
            if task['id'] == 'ch8_003':
                task['status'] = 'done'

# Add history log
data['history_log'].append({
    "date": "2026-05-01",
    "event": "Completed recovery of Chapter 8 Section 3",
    "agent": "arabic-specialist"
})

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated tracker: ch8_003 is done.")
