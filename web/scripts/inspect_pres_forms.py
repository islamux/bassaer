import re
import unicodedata
from pathlib import Path

PRESENTATION_FORMS = r"[\uFB50-\uFDFF\uFE70-\uFEFF]"
ORNATE_PARENS = ['﴾', '﴿']

files = list(Path('content').glob('*.md'))
for f_path in sorted(files):
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    matches = re.findall(PRESENTATION_FORMS, content)
    others = [m for m in matches if m not in ORNATE_PARENS]
    
    if others:
        print(f"File: {f_path.name} - Found {len(others)} non-ornate presentation forms.")
        unique_others = set(others)
        for char in sorted(list(unique_others)):
             norm = unicodedata.normalize('NFKC', char)
             print(f"  Char: {hex(ord(char))} ({char}) -> Normalized: {hex(ord(norm[0])) if norm else 'None'} ({norm})")
    else:
        # print(f"File: {f_path.name} - Only ornate parens or none found.")
        pass
