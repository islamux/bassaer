import re
import collections

filepath = "/media/islamux/Variety/JavaScriptProjects/bassaer/web/content/chapter-9.md"

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Find words ending with ي where the previous character isn't usually connecting, or maybe just look for pattern
# Actually, let's just find words ending with ي 
words = re.findall(r'[\u0600-\u06FF]+ي\b', text)
counts = collections.Counter(words)

for w, c in counts.most_common(50):
    print(f"{w}: {c}")

