#!/usr/bin/env python3
import os
import re
import unicodedata
from pathlib import Path

CONTENT_DIR = Path('content')

def normalize_text(content):
    """Normalize Unicode and fix presentation forms."""
    # Normalize to NFKC (maps presentation forms to standard Arabic)
    content = unicodedata.normalize('NFKC', content)
    return content

def fix_ocr_artifacts(content):
    """Fix common OCR split-word and character-confusion artifacts."""
    
    # 1. Spacing and broken words (The "Broken Ya" issue)
    # Common words where 'ي' got split as ' في' or ' في '
    broken_ya_patterns = [
        (r'الذ في', 'الذي'),
        (r'النب في', 'النبي'),
        (r'البخار في', 'البخاري'),
        (r'يعن في', 'يعني'),
        (r'تعن في', 'تعني'),
        (r'عل في', 'علي'),
        (r'ه في', 'هي'),
        (r'ف في', 'في'),
        (r'أب في', 'أبي'),
        (r'رض في', 'رضي'),
        (r'الربوب في', 'الربوبي'),
        (r'الهيومان في', 'الهيوماني'),
        (r'اللاديني في', 'اللاديني'),
        (r'أو في', 'أي'),
        (r'ب في', 'بي'),
        (r'ل في', 'لي'),
        (r'القرآب في', 'القرآني'),
        (r'الإنساب في', 'الإنساني'),
        (r'الرباب في', 'الرباني'),
        (r'العقلاب في', 'العقلاني'),
    ]
    for old, new in broken_ya_patterns:
        content = content.replace(old, new)

    # 2. Specific corruptions found in Chapter 6/12
    specific_fixes = [
        (r'الزبت\b', 'الزبير'),
        (r'قت ص\b', 'قبرص'),
        (r'ياش\b', 'ياسر'),
        (r'م حَ رَامٍ', 'أم حرام'),
        (r'أُمُّ حَرَامٍ', 'أم حرام'), # Keep it simple if needed
        (r'صِ ف ينَ', 'صفين'),
        (r'فَضَ حِكَ تْ', 'فضحكت'),
        (r'سار ها', 'سارها'),
        (r'أهْ لِه', 'أهله'),
        (r'وثيقري', 'توثيقي'),
        (r'توثيفري', 'توثيقي'),
        (r'ت يطانية', 'بريطانية'),
        (r'الت يطانية', 'البريطانية'),
        (r'اللاأدري', 'اللاأدري'), # Ensure normalization
    ]
    for old, new in specific_fixes:
        content = re.sub(old, new, content)

    # 3. Honorifics and the "ضرورة" mess
    # Revert "ضرورة" to "رضي" or "عنه/عنها" in specific contexts
    content = content.replace('ضرورة:عنها', 'رضي الله عنها')
    content = content.replace('ضرورة:عنه', 'رضي الله عنه')
    content = content.replace('ضرورة الله عنه', 'رضي الله عنه')
    content = content.replace('ضرورة الله عنها', 'رضي الله عنها')
    content = content.replace('رضي الله عنها ضرورة', 'رضي الله عنها')
    content = content.replace('رضي الله عنه ضرورة', 'رضي الله عنه')
    
    # Generic "ضرورة" following "الله" is almost always "رضي"
    content = re.sub(r'الله\s+ضرورة', 'الله عنه', content)
    content = re.sub(r'ضرورة\s+الله', 'رضي الله', content)

    return content

def cleanup_markdown(content):
    """Clean up markdown formatting and general spacing."""
    # Fix spacing around common Arabic punctuation
    content = re.sub(r'\s+([،؛؟!.])', r'\1', content)
    content = re.sub(r'([،؛؟])(?=[^\s\d])', r'\1 ', content)
    
    # Remove double spaces
    content = re.sub(r' +', ' ', content)
    
    # Fix stray characters like ' ُ '
    content = content.replace(' ُ ', ' ')
    
    return content

def process_file(file_path):
    print(f"Processing {file_path.name}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    content = normalize_text(content)
    content = fix_ocr_artifacts(content)
    content = cleanup_markdown(content)
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    if not CONTENT_DIR.exists():
        print(f"Error: {CONTENT_DIR} not found")
        return

    files = list(CONTENT_DIR.glob('*.md'))
    count = 0
    for f in sorted(files):
        if process_file(f):
            count += 1
    
    print(f"\nFinished! Updated {count} files.")

if __name__ == "__main__":
    main()
