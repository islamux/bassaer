#!/usr/bin/env python3
import os
import re
import unicodedata
from pathlib import Path

CONTENT_DIR = Path('content')

def normalize_text(content):
    # NFKC maps ligatures and presentation forms to standard Arabic characters
    return unicodedata.normalize('NFKC', content)

def deep_linguistic_fix(content):
    # Dictionary of systematic errors found in the audit
    fixes = {
        'إال ': 'إلا ',
        ' إال': ' إلا',
        ' إىل': ' إلى',
        'إىل ': ' إلى ',
        ' عىل': ' على',
        'عىل ': ' على ',
        'أكت ': 'أكثر ',
        'أكتر': 'أكثر',
        'األنبياء': 'الأنبياء',
        'األ مة': 'الأمة',
        'األجَ ل': 'الأجل',
        'األج ُل': 'الأجل',
        'األ طياف': 'الأطياف',
        'االنتهاء': 'الانتهاء',
        'االنتباه': 'الانتباه',
        'االقتباس': 'الاقتباس',
        'اإللحاد': 'الإلحاد',
        'اإلسالم': 'الإسلام',
        'اإلنسانية': 'الإنسانية',
        'اإليمان': 'الإيمان',
        'براهي ن': 'براهين',
        'براهي  ن': 'براهين',
        'ت اهي ن': 'براهين',
        'المسلمي ن': 'المسلمين',
        'المرسلي ن': 'المرسلين',
        'النن ي': 'النبي',
        'النر ي': 'التي',
        'فن ي': 'في',
        'ي نقد': 'في نقد',
        'ي بيان': 'في بيان',
        'ي الرد': 'في الرد',
        'ي حياتك': 'في حياتك',
        'ي دول': 'في دول',
        'ي العالم': 'في العالم',
        'ي نقد': 'في نقد',
        'ي أحيان': 'في أحيان',
        'ي هذا': 'في هذا',
        'ي الكتاب': 'في الكتاب',
        'ي رحلة': 'في رحلة',
        'ي ش ي ء': 'في شيء',
        'ي الوجود': 'في الوجود',
        'ي نفس المصدر': 'في نفس المصدر',
        'ي كل': 'في كل',
        'أ حق ق': 'أحقق',
        'أ قدمه': 'أقدمه',
        'أ ؤل ف': 'أؤلف',
        'نش ر ئ': 'نشأ',
        'معابن': 'معاني',
        'ألبن': 'لأن',
        'موس عاً': 'موسعاً',
        'حواىلي': 'حوالي',
        'عشر ة': 'عشرة',
        'مباشر ةا': 'مباشرةً',
        'كثت ة': 'كثيرة',
        'كبت ة': 'كبيرة',
        'بصت ة': 'بصيرة',
        'ٹٱٹٱ': '',
        'ٹٱٹ': '',
        'ٹ': '',
        'ﭧﭐﭨ': '',
        'ﭐﱡﭐ': '',
        'ﱠ': '',
        '﴿': '﴾', # swap if needed based on RTL flow in markdown
        '﴾': '﴿',
    }
    
    for old, new in fixes.items():
        content = content.replace(old, new)

    # Fix 'waw' (and) connectivity - should not have space after it if it's a conjunction
    # But in Arabic, 'waw' is a single letter word. Most OCRs put a space before but not after.
    # Actually, waw as 'and' should be attached to the next word.
    content = re.sub(r'\bو\s+([\u0621-\u064A])', r'و\1', content)
    
    # Fix 'fa' (so) connectivity
    content = re.sub(r'\bف\s+([\u0621-\u064A])', r'ف\1', content)

    # General cleanup
    content = re.sub(r' +', ' ', content)
    content = re.sub(r'([،؛؟!.])(?=[^\s\d])', r'\1 ', content)
    
    # Reverse the brackets swap if they look wrong (Quranic ornate brackets are usually U+FD3E and U+FD3F)
    # ﴿ is U+FD3F (LEFT), ﴾ is U+FD3E (RIGHT). In RTL, ﴿ is the start.
    content = content.replace('﴾', '﴿').replace('﴿', '﴾') # Simplified correction
    
    return content

def process_file(file_path):
    print(f"Processing {file_path.name}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    content = normalize_text(content)
    content = deep_linguistic_fix(content)
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    files = list(CONTENT_DIR.glob('*.md'))
    count = 0
    for f in sorted(files):
        if process_file(f):
            count += 1
    print(f"\nAudit and fix pass complete. Updated {count} files.")

if __name__ == "__main__":
    main()
