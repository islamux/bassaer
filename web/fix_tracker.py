import json

tracker_path = '../project-tracker.json'

with open(tracker_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for milestone in data['milestones']['active']:
    if milestone['id'] == 'content_ch7_recovery':
        for task in milestone['subtasks']:
            if task['id'] == 'ch7_006':
                if 'title' in task:
                    task['label'] = task.pop('title')
                task['priority'] = 'P1'
        break

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Fixed ch7_006 label in tracker!")
