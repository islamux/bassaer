import json
from datetime import datetime

tracker_path = '../project-tracker.json'

with open(tracker_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for milestone in data['milestones']['active']:
    if milestone['id'] == 'content_ch7_recovery':
        # Mark ch7_006 as done
        for task in milestone['subtasks']:
            if task['id'] == 'ch7_006':
                task['status'] = 'done'
        
        # Add new task
        new_task = {
            "id": "ch7_007",
            "label": "Extract and clean Chapter 7 sections 17-18",
            "status": "todo",
            "priority": "P1",
            "assignee": "arabic-specialist"
        }
        milestone['subtasks'].append(new_task)
        break

# Add history log
today = datetime.now().strftime("%Y-%m-%d")
log_entry = {
    "date": today,
    "action": "Recovered Chapter 7 Sections 13-16 from source PDF and updated tracker",
    "agent": "arabic-specialist"
}
data['history_log'].append(log_entry)

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Tracker updated successfully!")
