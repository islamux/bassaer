import re
import os
import collections

content_dir = "/media/islamux/Variety/JavaScriptProjects/bassaer-antigravity/web/content"
chapters = ["chapter-9.md", "chapter-10.md", "chapter-11.md", "chapter-12.md", "intro.md"]

words_with_fi = collections.Counter()
contexts = collections.defaultdict(set)

for ch in chapters:
    path = os.path.join(content_dir, ch)
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    lines = text.split('\n')
    for line in lines:
        words = re.findall(r'[\u0600-\u06FF]+', line)
        for w in words:
            if 'في' in w and w != 'في':
                words_with_fi[w] += 1
                if len(contexts[w]) < 3:
                    contexts[w].add(line.strip())

# List them out sorted by frequency, only top 150 or errors
count = 0
for word, freq in words_with_fi.most_common():
    # skip some very common correct ones to save output length
    if word in ['فيه', 'فيها', 'وفي', 'فيهم']:
        continue
    print(f"{word}: {freq}")
    for ctx in list(contexts[word])[:2]:
        print(f"   -> {ctx}")
    count += 1
    if count > 150:
        break
