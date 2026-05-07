#!/usr/bin/env python3
"""
fix_lam_alif.py — Merge broken lam-alif pairs separated by whitespace.

OCR often breaks the lam-alif ligature (لا) into ل + ا with whitespace between.
This script merges them back. It walks all web/content/*.md files.

Patterns fixed:
  - ل\n+ا  → لا  (separated by newline within a paragraph)
  - ل  +ا  → لا  (one or more spaces between)
"""

import re
import os
import glob

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'web', 'content')

def fix_lam_alif(text):
    text = re.sub(r'ل\s+ا', 'لا', text)
    return text

def main():
    md_files = sorted(glob.glob(os.path.join(CONTENT_DIR, '*.md')))
    total_fixes = 0

    for fpath in md_files:
        with open(fpath, 'r', encoding='utf-8') as f:
            original = f.read()

        fixed = fix_lam_alif(original)
        if fixed != original:
            fixes = len(re.findall(r'لا', fixed)) - len(re.findall(r'لا', original))
            total_fixes += fixes
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print(f'  {os.path.basename(fpath)}: {fixes} fixes')
        else:
            print(f'  {os.path.basename(fpath)}: no changes')

    print(f'\nTotal lam-alif fixes across all files: {total_fixes}')

if __name__ == '__main__':
    main()
