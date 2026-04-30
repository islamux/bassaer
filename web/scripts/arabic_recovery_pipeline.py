#!/usr/bin/env python3
import os
import re
import unicodedata
from pathlib import Path

CONTENT_DIR = Path('content')

def normalize_presentation_forms(content):
    """Normalizes Arabic Presentation Forms A and B to standard Arabic."""
    # This uses unicodedata to normalize NFKC which maps compatibility forms to standard forms
    # Also handle some specific ornate characters that might be missed
    content = unicodedata.normalize('NFKC', content)
    
    # Manual mappings for stubborn presentation forms if NFKC isn't enough
    stubborn_forms = {
        '\uFE81': '\u0622', # ARABIC LETTER ALEF WITH MADDA ABOVE ISOLATED FORM
        '\uFE8D': '\u0627', # ARABIC LETTER ALEF ISOLATED FORM
        '\uFE8E': '\u0627', # ARABIC LETTER ALEF FINAL FORM
        '\uFEE1': '\u0645', # ARABIC LETTER MEEM ISOLATED FORM
        '\uFEE2': '\u0645', # ARABIC LETTER MEEM FINAL FORM
        # Add more if needed after audit
    }
    for old, new in stubborn_forms.items():
        content = content.replace(old, new)
        
    return content

def fix_broken_ya(content):
    """Fixes common 'Ya' spacing errors like 'الذ في' -> 'الذي'."""
    # List of common words that end with 'ي' but got split into '.. في'
    patterns = [
        (r'الذ في', 'الذي'),
        (r'يعن في', 'يعني'),
        (r'تعن في', 'تعني'),
        (r'عل في', 'علي'),
        (r'ف في', 'في'),
        (r'ه في', 'هي'),
        (r'اللااكتراث في', 'اللااكتراثي'),
        (r'الربوب في', 'الربوبي'),
        (r'الهيومان في', 'الهيوماني'),
        (r'اللاديني في', 'اللادينيين'),
        (r'أو في', 'أي'),
        (r'ب في', 'بي'),
        (r'ل في', 'لي'),
        (r'النر في', 'التي'),
        (r'والنر في', 'والتي'),
    ]
    for old, new in patterns:
        content = content.replace(old, new)
    
    # Generic fix for words ending in ' في' that should probably be 'ي'
    content = re.sub(r'(\w{2,}) في\b', r'\1ي', content)
    
    # Specific fix for honorific corruption 'ضرورة' back to 'رضي'
    content = re.sub(r'رضي الله عن(ه|ها) ضرورة', r'رضي الله عن\1', content)
    content = re.sub(r'رضي الله (عنه|عنها) ضرورة', r'رضي الله \1', content)
    content = re.sub(r'رض في الله (عنه|عنها) ضرورة', r'رضي الله \1', content)
    content = re.sub(r'رض في الله (عنه|عنها)', r'رضي الله \1', content)
    content = re.sub(r'ضرورة:(عنه|عنها)', r'رضي الله \1', content)
    
    # Revert 'ضرورة' to 'رضي' when followed by 'الله'
    content = content.replace('ضرورة الله', 'رضي الله')
    
    # Protect valid usage
    content = content.replace('بالضرورة', 'TEMP_B_DORORA')
    content = content.replace('الضرورة', 'TEMP_AL_DORORA')
    
    # Specific common OCR corruptions to ضرورة
    content = content.replace('رضي الله عنه ضرورة', 'رضي الله عنه')
    
    # Cleanup artifacts like 'ضرورة:عنها'
    content = content.replace('ضرورة:عنها', 'رضي الله عنها')
    content = content.replace('ضرورة:عنه', 'رضي الله عنه')
    
    # Restore valid usage
    content = content.replace('TEMP_B_DORORA', 'بالضرورة')
    content = content.replace('TEMP_AL_DORORA', 'الضرورة')
    
    # Common words corrupted to ضرورة
    content = content.replace('اللاتر نام', 'الالتزام')
    
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
