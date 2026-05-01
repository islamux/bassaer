import json

tracker_path = '../project-tracker.json'

with open(tracker_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

active = data['milestones']['active']
completed = data['milestones']['completed']

# Find doc_agents_runbook
doc_milestone = None
for i, m in enumerate(active):
    if m['id'] == 'doc_agents_runbook':
        doc_milestone = active.pop(i)
        break

if doc_milestone:
    completed.append(doc_milestone)

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Moved doc_agents_runbook to completed.")
