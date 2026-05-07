#!/usr/bin/env python3
"""
fix_footnotes.py — Normalize footnote formatting in content files.

The OCR process introduced several footnote formatting issues:
1. Double opening parens:  ((123) → (123)
2. Space inside parens:   ( 123) → (123), (123 ) → (123)
3. Arabic footnote markers without parens cleanup

It walks all web/content/*.md files.
"""

import re
import os
import glob

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'web', 'content')

def fix_footnotes(text):
    text = re.sub(r'\(\s*\((\d+)\)', r'(\1)', text)
    text = re.sub(r'\((\d+)\s*\)', r'(\1)', text)
    text = re.sub(r'\(\s+(\d+)\)', r'(\1)', text)
    text = re.sub(r'\((\d+)\)\s*\.', r'(\1).', text)
    text = re.sub(r'\((\d+)\)\s*,', r'(\1),', text)
    return text

def main():
    md_files = sorted(glob.glob(os.path.join(CONTENT_DIR, '*.md')))
    total_fixes = 0

    for fpath in md_files:
        with open(fpath, 'r', encoding='utf-8') as f:
            original = f.read()

        fixed = fix_footnotes(original)
        if fixed != original:
            import difflib
            diff_count = sum(1 for a, b in zip(original.split('\n'), fixed.split('\n')) if a != b)
            total_fixes += diff_count
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print(f'  {os.path.basename(fpath)}: {diff_count} lines changed')
        else:
            print(f'  {os.path.basename(fpath)}: no changes')

    print(f'\nTotal footnote lines changed across all files: {total_fixes}')

if __name__ == '__main__':
    main()
