#!/usr/bin/env python3
import os
import re
import unicodedata
from pathlib import Path

CONTENT_DIR = Path('content')

def normalize_presentation_forms(content):
    """Normalizes Arabic Presentation Forms A and B to standard Arabic."""
    # This uses unicodedata to normalize NFKC which maps compatibility forms to standard forms
    return unicodedata.normalize('NFKC', content)

def fix_broken_ya(content):
    """Fixes common 'Ya' spacing errors like 'الذ في' -> 'الذي'."""
    # List of common words that end with 'ي' but got split into '.. في'
    patterns = [
        (r'الذ في', 'الذي'),
        (r'يعن في', 'يعني'),
        (r'تعن في', 'تعني'),
        (r'عل في', 'علي'), # Note: might be 'على' or 'علي', but usually 'علي' in this context
        (r'ف في', 'في'),
        (r'ه في', 'هي'),
        (r'اللااكتراث في', 'اللااكتراثي'),
        (r'الربوب في', 'الربوبي'),
        (r'الهيومان في', 'الهيوماني'),
        (r'اللاديني في', 'اللادينيين'), # Special case
        (r'أو في', 'أي'), # Often 'أي' becomes 'أو في'
        (r'ب في', 'بي'),
        (r'ل في', 'لي'),
    ]
    for old, new in patterns:
        content = content.replace(old, new)
    
    # Generic fix for words ending in ' في' that should probably be 'ي'
    # Use with caution: word must be at least 2 chars before ' في'
    content = re.sub(r'(\w{2,}) في\b', r'\1ي', content)
    
    # Specific fix for honorific corruption 'ضرورة' back to 'رضي'
    # Based on the audit finding: "رض في الله عائشة ضرورة:عنها"
    # This happens when 'رضي' was misidentified.
    
    # Patterns for religious honorifics
    content = re.sub(r'رضي الله عن(ه|ها) ضرورة', r'رضي الله عن\1', content)
    content = re.sub(r'رضي الله (عنه|عنها) ضرورة', r'رضي الله \1', content)
    content = re.sub(r'رض في الله (عنه|عنها) ضرورة', r'رضي الله \1', content)
    content = re.sub(r'رض في الله (عنه|عنها)', r'رضي الله \1', content)
    content = re.sub(r'ضرورة:(عنه|عنها)', r' \1', content)
    
    # Common words corrupted to 'ضرورة' that should be 'رضي' or similar
    # e.g. 'رضي' (part of honorific)
    # but be careful not to break 'بالضرورة' (which is usually correct)
    
    # Revert 'ضرورة' to 'رضي' when followed by 'الله'
    content = content.replace('ضرورة الله', 'رضي الله')
    
    # Clean up artifacts like 'ضرورة:عنها'
    content = content.replace('ضرورة:عنها', 'رضي الله عنها')
    content = content.replace('ضرورة:عنه', 'رضي الله عنه')
    
    return content

def fix_punctuation_spacing(content):
    """Ensures spaces after Arabic punctuation."""
    # Fix . or ، stuck between Arabic letters
    content = re.sub(r'([\u0600-\u06FF])([.،])([\u0600-\u06FF])', r'\1\2 \3', content)
    # Ensure space after punctuation if missing
    content = re.sub(r'([،؛؟])(?=[^\s\d])', r'\1 ', content)
    return content

def process_file(file_path):
    print(f"Recovering: {file_path.name}")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Normalize presentation forms
    content = normalize_presentation_forms(content)
    
    # 2. Fix broken 'Ya' and honorifics
    content = fix_broken_ya(content)
    
    # 3. Fix punctuation spacing
    content = fix_punctuation_spacing(content)
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    if not CONTENT_DIR.exists():
        print("Error: content directory not found.")
        return
    
    files = list(CONTENT_DIR.glob('*.md'))
    updated = 0
    for f in sorted(files):
        if process_file(f):
            updated += 1
            
    print(f"\nRecovery complete. Updated {updated} files.")

if __name__ == "__main__":
    main()
