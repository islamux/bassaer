#!/usr/bin/env python3
import os
import re
import sys
from pathlib import Path

# Import the existing replacements from comprehensive_arabic_fix if possible, 
# or just copy the logic for a clean single-file pipeline.
from comprehensive_arabic_fix import DIRECT_REPLACEMENTS, REGEX_REPLACEMENTS

def apply_fixes(content):
    # 1. Direct Replacements
    for old, new in DIRECT_REPLACEMENTS.items():
        content = content.replace(old, new)
    
    # 2. Regex Replacements
    for pattern, replacement in REGEX_REPLACEMENTS:
        content = re.sub(pattern, replacement, content)
        
    return content

def format_content(content):
    # Basic markdown formatting cleanup
    # Ensure blockquotes have space after >
    content = re.sub(r'^>(?!\s)', r'> ', content, flags=re.MULTILINE)
    # Ensure double newlines between paragraphs
    content = re.sub(r'(?<!\n)\n(?!\n)', r'\n\n', content)
    # Fix spacing around punctuation
    content = re.sub(r'\s+([،؛؟!.])', r'\1', content)
    return content

def process_file(file_path):
    print(f"Processing: {file_path.name}")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    content = apply_fixes(content)
    content = format_content(content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    content_dir = Path('content')
    if not content_dir.exists():
        print("Error: content directory not found.")
        sys.exit(1)
    
    files = list(content_dir.glob('*.md'))
    updated_count = 0
    
    for file_path in files:
        if process_file(file_path):
            updated_count += 1
            
    print(f"\nPipeline complete. Updated {updated_count} files.")

if __name__ == "__main__":
    main()
