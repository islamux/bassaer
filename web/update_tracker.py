import json
from datetime import datetime

tracker_path = '../project-tracker.json'

with open(tracker_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for milestone in data['milestones']['active']:
    if milestone['id'] == 'content_ch7_recovery':
        # Mark ch7_005 as done
        for task in milestone['subtasks']:
            if task['id'] == 'ch7_005':
                task['status'] = 'done'
        
        # Add new task
        new_task = {
            "id": "ch7_006",
            "title": "Extract and clean Chapter 7 sections 13-16",
            "status": "todo",
            "assignee": "arabic-specialist",
            "notes": "Using manual extraction to prevent structural corruption."
        }
        milestone['subtasks'].append(new_task)
        break

# Add history log
today = datetime.now().strftime("%Y-%m-%d")
log_entry = {
    "date": today,
    "action": "Recovered Chapter 7 Sections 9-12 from source PDF",
    "agent": "arabic-specialist"
}
data['history_log'].append(log_entry)

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Tracker updated successfully!")
