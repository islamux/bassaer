#!/usr/bin/env python3
"""
Arabic Proofreading Script v4 (Fixed) - Pass 3.
Fixes high-frequency reversed particles and words based on context.
"""

import os
import re
import sys
from collections import defaultdict

CONTENT_DIR = '/media/islamux/Variety/JavaScriptProjects/bassaer-antigravity/web/content'

corrections_log = defaultdict(int)

# Particle replacements using regex capturing groups
# (Pattern, Replacement_with_backref)
RE_REPLACEMENTS = [
    # 1. 'الو ' -> 'ولا '
    (r'\bالو\s', 'ولا '),
    
    # 2. 'الف ' -> 'فلا '
    (r'\bالف\s', 'فلا '),
    
    # 3. 'الم ' -> 'لم ' (Followed by verb)
    (r'\bالم\s(?=ي|ت|ن|أ)', 'لم '),
    
    # 4. 'أبر ' -> 'ظهر '
    (r'\bأبر\s', 'ظهر '),
    
    # 5. 'هل ' -> 'له ' (In non-interrogative context)
    # Replaces 'هل' when preceded by specific words, using capturing group for backref
    (r'(ليس|عادت|تنشرح|كان|أثر|بأن|الكون|ببساطة|صورة|أليس|الخاصة|القرآن|دولة|كتاب|المؤمن|القول|بأنه|أنه|أني|أنها|أنهم|أننا)\sهل\b', r'\1 له'),
    
    # 6. 'أن هل' -> 'أن له' 
    (r'(\sأن)\sهل\b', r'\1 له'),
]

# Word Joins & Particle Separations
WORD_JOINS = {
     'ي هذا': 'في هذا',
     'ي كل': 'في كل',
     'ي أي': 'في أي',
     'ي ذهن': 'في ذهن',
     'ي أوروبا': 'في أوروبا',
     'ي العالم': 'في العالم',
     'ي الأرض': 'في الأرض',
     'ي الدم': 'في الدم',
     'ي نفس': 'في نفس',
     'ي حال': 'في حال',
     'ي عين': 'في عين',
     'ي كتاب': 'في كتاب',
     'ي نهاية': 'في نهاية',
     'ي الوجود': 'في الوجود',
     'ي الكون': 'في الكون',
     'ي الحقيقة': 'في الحقيقة',
     'ي القرن': 'في القرن',
     'ي ذاك': 'في ذاك',
     'ي موضوع': 'في موضوع',
     'ي إطار': 'في إطار',
     'ي علم': 'في علم',
     'ي آخر': 'في آخر',
     'ي أية': 'في أية',
     'ي صميم': 'في صميم',
     'ي بنية': 'في بنية',
     'ي مركز': 'في مركز',
}

def apply_fixes(text, filename=""):
    """Apply v4 context-aware fixes."""
    
    # 1. Word joins
    for old, new in sorted(WORD_JOINS.items(), key=lambda x: -len(x[0])):
        if old in text:
            count = text.count(old)
            corrections_log[f"{old} → {new}"] += count
            text = text.replace(old, new)

    # 2. Particle replacements
    for pattern, replacement in RE_REPLACEMENTS:
        matches = list(re.finditer(pattern, text))
        if matches:
            corrections_log[f"{pattern} → {replacement}"] += len(matches)
            text = re.sub(pattern, replacement, text)
            
    # 3. Double spaces
    text = re.sub(r' +', ' ', text)
    return text

def process_file(filepath, dry_run=False):
    filename = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    
    fixed = apply_fixes(original, filename)
    
    if original != fixed:
        if not dry_run:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print(f"  ✓ Applied v4 fixes to {filename}")
        else:
            print(f"  [DRY RUN] Correcting {filename}")
        return True
    return False

def main():
    dry_run = '--dry-run' in sys.argv
    md_files = sorted([f for f in os.listdir(CONTENT_DIR) if f.endswith('.md')])
    changed = 0
    for fn in md_files:
        if process_file(os.path.join(CONTENT_DIR, fn), dry_run):
            changed += 1
    
    print(f"\nV4 Done! {changed} Modified.")
    if corrections_log:
        for corr, count in sorted(corrections_log.items(), key=lambda x: -x[1])[:15]:
            print(f"  {corr}: {count}")

if __name__ == '__main__':
    main()
