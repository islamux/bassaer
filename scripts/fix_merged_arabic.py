#!/usr/bin/env python3
"""Fix merged Arabic words where ال definite article is concatenated to previous word.

Rules:
  - Only fixes: Word1 + ال + Word2 where Word1 is a standalone word (no internal ال)
  - Rejects: الإلحاد-type splits (where prefix IS ال itself)
  - Rejects: وبالتالي/فبالتالي compounds (conjunction+preposition+ال)
  - Cross-word-boundary matches are rejected
  - Handles tashkeel correctly

BUGFIX: ms (stripped pos) ≠ Arabic letter index; must count Arabic letters only.
"""

import re, os

CHAPTERS_DIR = "content/chapters"
FILES = [
    "intro.md",
    "chapter-1.md", "chapter-2.md", "chapter-3.md", "chapter-4.md",
    "chapter-5.md", "chapter-6.md", "chapter-7.md", "chapter-8.md",
    "chapter-9.md", "chapter-10.md", "chapter-11.md", "chapter-12.md",
]
TASHKEEL = set('\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652\u0670')
ARABIC = re.compile(r'[\u0621-\u064A]')
ALEF_LAM = '\u0627\u0644'

def strip_tashkeel(t):
    return ''.join(c for c in t if c not in TASHKEEL)

def arabic_positions(t):
    return [i for i, c in enumerate(t) if ARABIC.match(c)]

def has_alefthenlam(s):
    return ALEF_LAM in s

def arabic_count_before(text, pos):
    """Count Arabic letters in text before position pos."""
    return sum(1 for c in text[:pos] if ARABIC.match(c))

def fix_line(line):
    fixes = 0
    while True:
        clean = strip_tashkeel(line)
        matches = list(re.finditer(r'([\u0621-\u064A]{2,})ال([\u0621-\u064A]{2,})', clean))
        if not matches:
            return line, fixes
        applied = False
        for m in matches:
            prefix, suffix = m.group(1), m.group(2)
            ms, me = m.start(), m.end()

            if len(suffix) == 2 and suffix != 'له':
                continue

            # Reject if prefix STARTS with ال (like الإلحاد — prefix=ال itself)
            if prefix.startswith(ALEF_LAM):
                continue

            # Skip short prefixes (<=3 letters) starting with و/ف (likely conjunction+article)
            if len(prefix) <= 3 and prefix[0] in '\u0648\u0641':
                continue

            pos = arabic_positions(line)

            # Count Arabic letters up to ms in the CLEAN text (not ms as index!)
            letter_at_start = arabic_count_before(clean, ms)
            letter_at_end = arabic_count_before(clean, me)

            # The last Arabic letter of the match
            match_last_letter_idx = letter_at_end - 1

            if letter_at_start >= len(pos) or match_last_letter_idx >= len(pos):
                continue

            # Word-boundary BEFORE match: char before first Arabic letter of match
            first_letter_orig = pos[letter_at_start]
            before_idx = first_letter_orig - 1
            if before_idx >= 0 and ARABIC.match(line[before_idx]):
                continue

            # Word-boundary AFTER match: char after last Arabic letter
            last_letter_orig = pos[match_last_letter_idx]
            after_idx = last_letter_orig + 1
            while after_idx < len(line) and line[after_idx] in TASHKEEL:
                after_idx += 1
            if after_idx < len(line) and ARABIC.match(line[after_idx]):
                continue

            # Find insertion point: right before the alif of ال
            pfx_end = pos[letter_at_start + len(prefix) - 1]
            ins = pfx_end + 1
            while ins < len(line) and line[ins] in TASHKEEL:
                ins += 1
            if ins < len(line) and line[ins] == '\u0627':
                chars = list(line)
                chars.insert(ins, ' ')
                line = ''.join(chars)
                fixes += 1
                applied = True
                break
        if not applied:
            return line, fixes


def fix_file(fn):
    path = os.path.join(CHAPTERS_DIR, fn)
    if not os.path.exists(path):
        print(f"Skipping {fn}: not found"); return 0
    with open(path, encoding='utf-8') as f:
        orig = f.read()
    out, total = [], 0
    for lineno, line in enumerate(orig.split('\n'), 1):
        fl, c = fix_line(line)
        out.append(fl)
        if c:
            total += c
            print(f"  {fn}:{lineno} — {c} fix(es)")
    if total:
        with open(path + '.bak', 'w', encoding='utf-8') as f:
            f.write(orig)
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(out))
        print(f"{fn}: {total} total fixes (backup: {path}.bak)")
    else:
        print(f"{fn}: no fixes needed")
    return total

if __name__ == '__main__':
    t = sum(fix_file(f) for f in FILES)
    print(f"\nTotal: {t} fixes")
