import re
import os
import collections

content_dir = "/media/islamux/Variety/JavaScriptProjects/bassaer/web/content"
chapters = ["chapter-5.md", "chapter-6.md", "chapter-7.md", "chapter-8.md"]

words_with_fi = collections.Counter()

for ch in chapters:
    path = os.path.join(content_dir, ch)
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # words that contain "في" excluding the exact standalone word "في"
    # we want to catch things like البَاغِفيَة, الأنْبِفيَاءِ etc
    # Arabic characters only
    words = re.findall(r'[\u0600-\u06FF]+', text)
    for w in words:
        if 'في' in w and w != 'في':
            words_with_fi[w] += 1

# List them out sorted by frequency
for word, count in words_with_fi.most_common():
    print(f"{word}: {count}")
