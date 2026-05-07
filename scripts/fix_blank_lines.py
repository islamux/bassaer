#!/usr/bin/env python3
"""
fix_blank_lines.py — Remove excessive blank lines from OCR'd content.

The OCR process created an alternating text-blank-text-blank pattern
(~48% blank lines). Blank lines cannot simply be collapsed since they're all
single blanks. This script intelligently removes blank lines while preserving
structure around Markdown headers.

Rules:
  - Keep blank line if adjacent line (prev/next non-blank) starts with #
  - Remove all other single blank lines
"""

import os
import glob

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'web', 'content')

def fix_blank_lines(text):
    lines = text.split('\n')
    n = len(lines)
    keep = [True] * n  

    for i in range(n):
        line = lines[i]
        if line.strip() != '':
            continue

        prev_non_blank = next_prev = -1
        for j in range(i - 1, -1, -1):
            if lines[j].strip() != '':
                prev_non_blank = j
                break

        next_non_blank = -1
        for j in range(i + 1, n):
            if lines[j].strip() != '':
                next_non_blank = j
                break

        if prev_non_blank == -1 or next_non_blank == -1:
            continue

        prev_starts_header = lines[prev_non_blank].strip().startswith('#')
        next_starts_header = lines[next_non_blank].strip().startswith('#')

        if prev_starts_header or next_starts_header:
            continue

        keep[i] = False

    result = [lines[i] for i in range(n) if keep[i]]
    return '\n'.join(result)

def main():
    md_files = sorted(glob.glob(os.path.join(CONTENT_DIR, '*.md')))
    total_removed = 0

    for fpath in md_files:
        with open(fpath, 'r', encoding='utf-8') as f:
            original = f.read()

        fixed = fix_blank_lines(original)
        if fixed != original:
            original_lines = original.split('\n')
            fixed_lines = fixed.split('\n')
            removed = len(original_lines) - len(fixed_lines)
            total_removed += removed
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print(f'  {os.path.basename(fpath)}: removed {removed} blank lines (now {len(fixed_lines)} lines)')
        else:
            print(f'  {os.path.basename(fpath)}: no changes')

    print(f'\nTotal blank lines removed across all files: {total_removed}')

if __name__ == '__main__':
    main()
