import json

tracker_path = '../project-tracker.json'

with open(tracker_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

active = data['milestones']['active']
completed = data['milestones']['completed']
backlog = data['milestones']['backlog']

# Find content_ch7_recovery
ch7_milestone = None
for i, m in enumerate(active):
    if m['id'] == 'content_ch7_recovery':
        ch7_milestone = active.pop(i)
        break

if ch7_milestone:
    completed.append(ch7_milestone)

# Move content_ch8_recovery from backlog to active if it exists
ch8_milestone = None
for i, m in enumerate(backlog):
    if m['id'] == 'content_ch8_recovery':
        ch8_milestone = backlog.pop(i)
        break

if ch8_milestone:
    active.append(ch8_milestone)

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Milestone moved to completed. Chapter 8 moved to active.")
