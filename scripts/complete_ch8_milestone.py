import json

tracker_path = '../project-tracker.json'

with open(tracker_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

milestone_to_complete = None
for milestone in data['milestones']['active']:
    if milestone['id'] == 'content_ch8_recovery':
        for task in milestone['subtasks']:
            if task['id'] == 'ch8_005':
                task['status'] = 'done'
        milestone_to_complete = milestone
        break

if milestone_to_complete:
    data['milestones']['active'].remove(milestone_to_complete)
    milestone_to_complete['status'] = 'completed'
    milestone_to_complete['completed_at'] = "2026-05-01"
    data['milestones']['completed'].append(milestone_to_complete)

# Add history log
data['history_log'].append({
    "date": "2026-05-01",
    "event": "Completed recovery of Chapter 8 (Sections 1-5). Content is now contiguous and production-ready.",
    "agent": "arabic-specialist"
})

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated tracker: Chapter 8 recovery is completed.")
