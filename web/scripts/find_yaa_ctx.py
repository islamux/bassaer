import re

filepath = "/media/islamux/Variety/JavaScriptProjects/bassaer/web/content/chapter-9.md"

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

words_to_check = ['فيي', 'بنني', 'لاي', 'ففيي', 'لمي', 'ماي', 'ذفي', 'الذيي', 'وردي', 'إلاي', 'اللهي', 'مصر']

for w in words_to_check:
    print(f"--- {w} ---")
    # find occurrences with some context
    matches = re.finditer(r'(.{0,30})(\b' + w + r'\b)(.{0,30})', text)
    count = 0
    for m in matches:
        print(m.group(0))
        count += 1
        if count >= 3:
            break
