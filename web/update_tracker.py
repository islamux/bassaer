import json
from datetime import datetime

tracker_path = '../project-tracker.json'

with open(tracker_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for milestone in data['milestones']['active']:
    if milestone['id'] == 'doc_agents_runbook':
        # Mark doc_001 as done
        for task in milestone['subtasks']:
            if task['id'] == 'doc_001':
                task['status'] = 'done'
        break

# Add history log
today = datetime.now().strftime("%Y-%m-%d")
log_entry = {
    "date": today,
    "action": "Created AGENTS.md runbook with Command Center CLI documentation and Agent Personas",
    "agent": "orchestrator"
}
data['history_log'].append(log_entry)

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Tracker updated successfully!")
