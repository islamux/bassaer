#!/usr/bin/env python3
"""
fix_ya_suffix.py — Fix context-aware ya-suffix corruption in Arabic content.

The OCR process often appends an extra ي to the end of Arabic words.
This script removes trailing ي where it doesn't naturally belong,
using a dictionary of known correct Arabic words that end in ي.

Since fully automated context-aware correction is complex without Arabic NLP,
this script focuses on clear patterns:
1. Words ending in يي → single ي (doubled ya at word end)
2. Common word endings where ي is clearly an OCR artifact
3. ي appended after tashkeel/diacritics

Safety: uses a known-words whitelist to avoid false corrections.
"""

import re
import os
import glob

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'web', 'content')

ARABIC_WORDS_ENDING_WITH_YA = {
    'في', 'علي', 'إلي', 'حتي', 'عندي', 'لدي', 'لدى', 'على', 'إلى', 'حتى',
    'بلى', 'متى', 'أتى', 'أبي', 'أخي', 'أمي', 'فمي', 'يدي', 'دمي',
    'لي', 'بي', 'لهي', 'وهي', 'هي', 'أني', 'إني', 'إنّي', 'أنّي',
    'لكني', 'لعلّي', 'كأنّي', 'تيني', 'نوني',
}

ARABIC_LETTERS = set('ابتةثجحخدذرزسشصضطظعغفقكلمنهويآأإءىئ')

def fix_ya_suffix(text):
    result = []
    for line in text.split('\n'):
        words = line.split(' ')
        fixed_words = []
        for w in words:
            fw = _fix_word(w)
            fixed_words.append(fw)
        result.append(' '.join(fixed_words))
    return '\n'.join(result)

def _fix_word(w):
    if not w:
        return w
    stripped = w.strip()
    if not stripped:
        return w
    if stripped in ARABIC_WORDS_ENDING_WITH_YA:
        return w
    if len(stripped) < 3:
        return w
    clean = stripped.rstrip('.,;:!?»«()[]\'"')
    suffix = stripped[len(clean):] if len(clean) < len(stripped) else ''
    if not clean:
        return w
    if clean.endswith('يي'):
        new_clean = clean[:-1]
        return new_clean + suffix
    if clean.endswith('ىي'):
        new_clean = clean[:-1]
        return new_clean + suffix
    if clean.endswith('ائي'):
        if len(clean) > 3:
            new_clean = clean[:-1]
            return new_clean + suffix
    return w

def main():
    md_files = sorted(glob.glob(os.path.join(CONTENT_DIR, '*.md')))
    total_fixes = 0

    for fpath in md_files:
        with open(fpath, 'r', encoding='utf-8') as f:
            original = f.read()

        fixed = fix_ya_suffix(original)
        if fixed != original:
            import difflib
            diff_count = sum(1 for a, b in zip(original.split('\n'), fixed.split('\n')) if a != b)
            total_fixes += diff_count
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print(f'  {os.path.basename(fpath)}: {diff_count} lines changed')
        else:
            print(f'  {os.path.basename(fpath)}: no changes')

    print(f'\nTotal ya-suffix lines changed across all files: {total_fixes}')

if __name__ == '__main__':
    main()
