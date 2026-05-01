import json
from datetime import datetime

tracker_path = '../project-tracker.json'

with open(tracker_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for milestone in data['milestones']['active']:
    if milestone['id'] == 'content_ch7_recovery':
        # Mark ch7_007 as done
        for task in milestone['subtasks']:
            if task['id'] == 'ch7_007':
                task['status'] = 'done'
        break

# Add history log
today = datetime.now().strftime("%Y-%m-%d")
log_entry = {
    "date": today,
    "action": "Completed Chapter 7 recovery by extracting and cleaning Sections 17-18 from source PDF",
    "agent": "arabic-specialist"
}
data['history_log'].append(log_entry)

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Tracker updated successfully!")
