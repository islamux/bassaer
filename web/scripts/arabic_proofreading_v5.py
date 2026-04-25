#!/usr/bin/env python3
import os
import re
import unicodedata
from pathlib import Path

CONTENT_DIR = Path('content')

def normalize_text(content):
    return unicodedata.normalize('NFKC', content)

def fix_ocr_artifacts(content):
    # Specific targeted fixes for intro and common artifacts
    fixes = {
        'براهي ن': 'براهين',
        'براهي  ن': 'براهين',
        'ت اهي ن': 'براهين',
        'المسلمي ن': 'المسلمين',
        'المرسلي ن': 'المرسلين',
        'األنبياء': 'الأنبياء',
        'األ مة': 'الأمة',
        'األجَ ل': 'الأجل',
        'األج ُل': 'الأجل',
        'األ طياف': 'الأطياف',
        'عشر ة': 'عشرة',
        'مباشر ةا': 'مباشرةً',
        'كثت ة': 'كثيرة',
        'بصت ة': 'بصيرة',
        'كبت ة': 'كبيرة',
        'االنتهاء': 'الانتهاء',
        'االنتباه': 'الانتباه',
        'االقتباس': 'الاقتباس',
        'اإللحاد': 'الإلحاد',
        'اإلسالم': 'الإسلام',
        'اإلنسانية': 'الإنسانية',
        'اإليمان': 'الإيمان',
        'ٹٱٹٱ': '',
        'ٹٱٹ': '',
        'ٹ': '',
        'ُفاأل مة': 'فالأمة',
        'حواىلي': 'حوالي',
        'موس عاً': 'موسعاً',
        'معابن': 'معاني',
        'النن ي': 'النبي',
        'النر ي': 'التي',
        'وبانتهاء هذ ا المشروع': 'وبانتهاء هذا المشروع',
        'ال يس ع ني': 'لا يسعني',
        'يسَّ ر لي': 'يسر لي',
    }
    for old, new in fixes.items():
        content = content.replace(old, new)
    
    # Generic fixes
    content = re.sub(r'([^\s])\s+ن\b', r'\1ن', content) # Fix trailing 'n'
    content = re.sub(r'([^\s])\s+ة\b', r'\1ة', content) # Fix trailing 'ta marbuta'
    content = re.sub(r'([^\s])\s+ي\b', r'\1ي', content) # Fix trailing 'ya'
    
    return content

def process_file(file_path):
    print(f"Processing {file_path.name}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    content = normalize_text(content)
    content = fix_ocr_artifacts(content)
    
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
