import json

tracker_path = '/media/islamux/Variety/JavaScriptProjects/bassaer-antigravity/project-tracker.json'

with open(tracker_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update dashboard to reflect current state
data['dashboard']['current_focus'] = "Search Feature Implementation"
data['dashboard']['active_milestone'] = "feat_search"
data['dashboard']['next_priority'] = "Researching search solutions (Pagefind/Flexsearch) for Arabic content"

with open(tracker_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated tracker dashboard.")
