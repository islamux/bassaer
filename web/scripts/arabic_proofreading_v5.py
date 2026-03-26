#!/usr/bin/env python3
"""
Arabic Proofreading Script v5 - Pass 4.
Fixes complex word reversals and OCR corruptions:
- أيش -> أيسر
- البجلاو -> والجبال
- رضياط -> صراط
- الًيج -> أجيال
- various technical/theological terms
"""

import os
import re
import sys
from collections import defaultdict

CONTENT_DIR = '/media/islamux/Variety/JavaScriptProjects/bassaer-antigravity/web/content'
corrections_log = defaultdict(int)

# Specific word mappings
WORD_REPLACEMENTS = {
    # ===== أيش -> أيسر patterns =====
    'وأيش وأقصر': 'وأيسر وأقصر',
    'وأيش وأفضل': 'وأيسر وأفضل',
    'أيشُ باب': 'أيسرُ باب',
    'النموذج الأيش': 'النموذج الأيسر',
    'أيشَ ُ على': 'أيسرُ على',
    'أيشَ ُ بكثير': 'أيسرُ بكثير',
    'الأيش م تِنا': 'الأيسر لأمتنا',
    'أيش ': 'أيسر ',
    'الأيش': 'الأيسر',
    
    # ===== البجلاو -> والجبال =====
    'البجلاو': 'والجبال',
    'الجبال': 'الجبال', # Identity to be safe
    
    # ===== رضياط -> صراط =====
    'رضياط': 'صراط',
    'الرضياط': 'الصراط',
    
    # ===== الًيج -> أجيال =====
    'الًيج': 'أجيال',
    
    # ===== البج (contextual) =====
    'يُذيب البج': 'يُذيب الحُجُب',
    
    # ===== Other OCR reversals =====
    'الأقولا': 'الأقوال',
    'الأحولا': 'الأحوال',
    'ألوجه': 'لأوجه',
    'الف بد': 'فلا بدّ',
    'الف يملك': 'فلا يملك',
    'الف تطعن': 'فلا تطعن',
    
    # ===== Specific Chapter 5/11 fixes =====
    'يُبشر النبي ﷺ أصحابَه': 'يُبشر النبي ﷺ أصحابه',
    'يُبشره': 'يُبشره',
    'ببشر': 'ببشر',
    
    # ===== حِ نص → حِصن =====
    'حِ نص': 'حِصن',
    'الحِ نص': 'الحِصن',
    
    # ===== الًبمع → بمعنًى =====
    'الًبمع': 'بمعنًى',
    
    # ===== الهباء أ الًيج =====
    'الهباء أ الًيج': 'الهباء أجيالاً',
    
    # ===== ي الحديث المتفق =====
    'ي الحديث المتفق': 'في الحديث المتفق',
    
    # ===== سيبفر → سيبقى =====
    'سيبفر': 'سيبقى',
    'يبفر': 'يبقى',
    'تبفر': 'تبقى',
}

def apply_v5_fixes(text):
    # 1. Direct replacements
    sorted_repls = sorted(WORD_REPLACEMENTS.items(), key=lambda x: -len(x[0]))
    for old, new in sorted_repls:
        if old in text:
            count = text.count(old)
            corrections_log[f"{old} → {new}"] += count
            text = text.replace(old, new)
            
    # 2. Sequential particles (often split in OCR)
    # 'لم يزل'
    text = text.replace('لم يزل', 'لم يزل') # already correct usually
    
    # 3. Clean up specific OCR artifacts
    text = re.sub(r' +', ' ', text)
    return text

def process_file(filepath, dry_run=False):
    filename = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    
    fixed = apply_v5_fixes(original)
    
    if original != fixed:
        if not dry_run:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print(f"  ✓ Applied v5 fixes to {filename}")
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
    
    print(f"\nV5 Done! {changed} Modified.")
    if corrections_log:
        for corr, count in sorted(corrections_log.items(), key=lambda x: -x[1])[:20]:
            print(f"  {corr}: {count}")

if __name__ == '__main__':
    main()
