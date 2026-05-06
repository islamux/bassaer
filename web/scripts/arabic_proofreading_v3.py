#!/usr/bin/env python3
"""
Arabic Proofreading Script v3 - Pass 2.
Fixes remaining context-dependent OCR errors:
- ألن → لأن patterns
- الإ → إلا
- ً ا → ًا (tanwin spacing)
- Space before punctuation
"""

import os
import re
import sys
from collections import defaultdict

CONTENT_DIR = '/media/islamux/Variety/JavaScriptProjects/bassaer/web/content'

corrections_log = defaultdict(int)

# Direct replacements
DIRECT_REPLACEMENTS = {
    # ===== ألن → لأن family =====
    'ألنه': 'لأنه',
    'ألنها': 'لأنها',
    'ألنهم': 'لأنهم',
    'ألنهما': 'لأنهما',
    'ألنك': 'لأنك',
    'ألنكم': 'لأنكم',
    'ألننا': 'لأننا',
    'ألني': 'لأني',
    'ألن ': 'لأن ',
    
    # ===== ً ا → ًا (tanwin with extra space) =====
    'ً ا': 'ًا',
    
    # ===== الإ → إلا =====
    'الإ ': 'إلا ',
    
    # ===== ألوجه → لأوجه =====
    'ألوجه': 'لأوجه',
    
    # ===== وأيسر patterns - too context-dependent, skipped =====
    'وأيش وأقصر': 'وأيسر وأقصر',
    'وأيش وأفضل': 'وأيسر وأفضل',
    'أن أيش وأفضل': 'أن أيسر وأفضل',
    
    # ===== ب ُهات → شُبهات =====
    'الش بُهات': 'الشُّبهات',
    'ش بُهة': 'شُبهة',
    'شيءبهة': 'شبهة',
    
    # ===== قي ومية → قيُّومية =====
    'قي ومية': 'قيُّومية',
    'قي وم': 'قيُّوم',
    
    # ===== بي نة → بيّنة =====
    'بي نة': 'بيّنة',
    
    # ===== خطورةا → خطورةً =====
    'خطورةا': 'خطورةً',
    'صورةا': 'صورةً',
    'مرتاعةا': 'مرتاعةً',
    'مستقلةا': 'مستقلةً',
    'حيةا': 'حيةً',
    'مباشرةا': 'مباشرةً',
    'سطحيةا': 'سطحيةً',
    'كاملةا': 'كاملةً',
    'ساطعةا': 'ساطعةً',
    
    # ===== نُسب → نُسب =====
    'نُسبت': 'نُسبت',
    
    # ===== الًبمع → بمعنًى =====
    
    # ===== يُسمّى ب  → يُسمّى بـ =====
    'يُسمّى ب ': 'يُسمّى بـ',
    
    # ===== حدوث قوانين → حقائق قوانين =====
    # Context-specific, skip
    
    # ===== دومً ا → دومًا =====
    'دومً ا': 'دومًا',
    'سليمً ا': 'سليمًا',
    'تمامً ا': 'تمامًا',
    'يوميً ا': 'يوميًا',
    'حتمً ا': 'حتمًا',
    'زورً ا': 'زورًا',
    'قصورً ا': 'قصورًا',
    'شيعً ا': 'شيئًا',
    'رُغمً ا': 'رُغمًا',
    
    # ===== سابقً ا → سابقًا =====
    'سابقً ا': 'سابقًا',
    'لاحقً ا': 'لاحقًا',
    'تحديدً ا': 'تحديدًا',
    'وَفقً ا': 'وَفقًا',
    'مُطبِقً ا': 'مُطبِقًا',
    'أزليً ا': 'أزليًا',
    'طبقً ا': 'طبقًا',
    'مستقلً ا': 'مستقلًا',
    'كافيً ا': 'كافيًا',
    'فعليً ا': 'فعليًا',
    'قائمً ا': 'قائمًا',
    'واقعً ا': 'واقعًا',
    'مُشاهدً ا': 'مُشاهدًا',
    'مُتكررً ا': 'مُتكررًا',
    'مستقبليً ا': 'مستقبليًا',
    'حَعرً ا': 'حصرًا',
    'مَجرً ا': 'مجرًا',
    
    # ===== Spacing =====
    'الأقولا': 'الأقوال',
    'الأحولا': 'الأحوال',
    
    # ===== Additional word-level fixes =====
    'حرفيًّاي': 'حرفيًّا',
    'تُدر س': 'تُدرَّس',
    'حكِّمْ': 'حكِّمْ',
    'محصر': 'محض',
    'العَ ل م': 'العَلَم',
    'العَ ل ق': 'العَلاق',
    'عَ القة': 'عَلاقة',
    'طُ مأنينة': 'طُمأنينة',
    # 'البج' removed - context-dependent, needs manual review
    'الفَ رْ ق': 'الفَرْق',
    'فَرْ ق': 'فَرْق',
}


def apply_fixes(text, filename=""):
    """Apply all fixes."""
    # 1. Direct replacements (longest first)
    sorted_replacements = sorted(DIRECT_REPLACEMENTS.items(), key=lambda x: -len(x[0]))
    for old, new in sorted_replacements:
        if old != new and old in text:
            count = text.count(old)
            corrections_log[f"{old} → {new}"] += count
            text = text.replace(old, new)
    
    # 2. Fix remaining double spaces
    text = re.sub(r' {2,}', ' ', text)
    
    return text


def process_file(filepath, dry_run=False):
    filename = os.path.basename(filepath)
    print(f"Processing: {filename}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    
    fixed = apply_fixes(original, filename)
    
    if original != fixed:
        if not dry_run:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print(f"  ✓ Applied corrections to {filename}")
        else:
            print(f"  [DRY RUN] Would apply corrections to {filename}")
        return True
    else:
        print(f"  - No changes needed in {filename}")
        return False


def main():
    if not os.path.exists(CONTENT_DIR):
        print(f"Error: {CONTENT_DIR} not found")
        sys.exit(1)
    
    dry_run = '--dry-run' in sys.argv
    
    if dry_run:
        print("DRY RUN MODE")
    
    print(f"Content: {CONTENT_DIR}")
    print("=" * 60)
    
    md_files = sorted([f for f in os.listdir(CONTENT_DIR) if f.endswith('.md')])
    print(f"Found {len(md_files)} files\n")
    
    changed = 0
    for fn in md_files:
        if process_file(os.path.join(CONTENT_DIR, fn), dry_run):
            changed += 1
    
    print(f"\nDone! {changed}/{len(md_files)} files modified.")
    
    if corrections_log:
        print("\nCORRECTIONS (top 30):")
        for correction, count in sorted(corrections_log.items(), key=lambda x: -x[1])[:30]:
            print(f"  {correction}: {count}")
        print(f"\n  Total: {sum(corrections_log.values())}")


if __name__ == '__main__':
    main()
