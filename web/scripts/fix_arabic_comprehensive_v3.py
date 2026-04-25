#!/usr/bin/env python3
import os
import re
import unicodedata
from pathlib import Path

CONTENT_DIR = Path('content')

def normalize_text(content):
    return unicodedata.normalize('NFKC', content)

def fix_broken_ya(content):
    # Fix words split with 'في' or ' في' at the end
    # Using specific Arabic character range to be safe
    content = re.sub(r'([\u0621-\u064A]{2,})\s*في\b', r'\1ي', content)
    
    # Specific common ones
    special_cases = {
        'الذ في': 'الذي',
        'النب في': 'النبي',
        'النب ي': 'النبي',
        'البخار في': 'البخاري',
        'رض في': 'رضي',
        'عل في': 'علي',
        'أب في': 'أبي',
        'الت في': 'التي',
        'في في': 'في',
        'بشر ها': 'بشرها',
    }
    for old, new in special_cases.items():
        content = content.replace(old, new)
    return content

def fix_names_and_honorifics(content):
    # Fix name corruptions
    names_fixes = [
        (r'الزبت\b', 'الزبير'),
        (r'الزبتضرورة', 'الزبير رضي الله عنه'),
        (r'عياش ضرورة', 'عياش رضي الله عنه'),
        (r'عمر بن العاص ضرورة', 'عمر بن العاص رضي الله عنه'),
        (r'ابن عفان ضرورة', 'ابن عفان رضي الله عنه'),
        (r'عائشة ضرورة', 'عائشة رضي الله عنها'),
        (r'أم حرام ضرورة', 'أم حرام رضي الله عنها'),
        (r'عمار بن ياش', 'عمار بن ياسر'),
        (r'سعيد الخُ دري', 'سعيد الخدري'),
        (r'أب في بكر', 'أبو بكر'),
        (r'ألب في بكر', 'لأبي بكر'),
    ]
    for old, new in names_fixes:
        content = re.sub(old, new, content)

    # General honorific fixes
    content = content.replace('رضي الله عنه ضرورة', 'رضي الله عنه')
    content = content.replace('رضي الله عنها ضرورة', 'رضي الله عنها')
    content = content.replace('ضرورة:عنها', 'رضي الله عنها')
    content = content.replace('ضرورة:عنه', 'رضي الله عنه')
    
    # Fix "ضرورة" when it's clearly a corruption of "رضي"
    # (followed by "الله" or following a name)
    content = re.sub(r'ضرورة\s+الله', 'رضي الله', content)
    content = re.sub(r'الله\s+ضرورة', 'الله عنه', content)
    
    return content

def fix_general_ocr(content):
    general_fixes = [
        (r'الس نة', 'السنة'),
        (r'التر اث', 'التراث'),
        (r'الإصالح', 'الإصلاح'),
        (r'ببراهين', 'ببراهين'), # check spacing
        (r'غت\b', 'غير'),
        (r'غتسبيل', 'غير سبيل'),
        (r'بالمجلد إن شاء اللهي!القادم', 'بالمجلد القادم إن شاء الله'),
        (r'توثيفري', 'توثيقي'),
        (r'وثيقري', 'توثيقي'),
        (r'أهْ لِه', 'أهله'),
        (r'فَضَ حِكَ تْ', 'فضحكت'),
        (r'فالذييُشكك', 'فالذي يشكك'),
        (r'فيفي', 'في'),
        (r'علىن\b', 'على نص'),
        (r'للن ر\b', 'للنص'),
        (r'بالن ر\b', 'بالنص'),
        (r'ن ر\b', 'نص'),
    ]
    for old, new in general_fixes:
        content = re.sub(old, new, content)
    return content

def cleanup(content):
    # Normalize spaces
    content = re.sub(r' +', ' ', content)
    # Spacing after punctuation
    content = re.sub(r'([،؛؟!.])(?=[^\s\d])', r'\1 ', content)
    return content

def process_file(file_path):
    print(f"Processing {file_path.name}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    content = normalize_text(content)
    content = fix_broken_ya(content)
    content = fix_names_and_honorifics(content)
    content = fix_general_ocr(content)
    content = cleanup(content)
    
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
    print(f"\nUpdated {count} files.")

if __name__ == "__main__":
    main()
