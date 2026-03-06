import os
import re

def clean_arabic_text(text):
    # 1. Compress multiple spaces into one
    text = re.sub(r' +', ' ', text)
    
    # 2. Basic fixed replacements
    fixes = {
        'اأ': 'الأ',
        'اإ': 'الإ',
        'اآ': 'الآ',
        'أخت': 'أخبر',
        'أختبأن': 'أخبر بأن',
        'حنر': 'حتى',
        'ن ي هللا عنه': 'رضي الله عنه',
        'ن يهللاعنه': 'رضي الله عنه',
        'رضي الله عنه رضي': 'رضي الله عنه',
        'رص ي': 'رضي',
        'رص': 'رضي',
        'أ أو لُ': 'أول',
        'أو لُ': 'أول',
        'أو لِ': 'أول',
        'الألو لِين': 'الأولين',
        'لألولين': 'للأولين',
        'الألو لُ': 'الأول',
        'الألو لِ': 'الأول',
        'م حرام': 'أم حرام',
        'أ سيموتون': 'سيموتون',
        'أ م ': 'أم ',
        'أخبربها': 'أخبر بها',
        'أخبربه': 'أخبر به',
        'أخبربهذا': 'أخبر بهذا',
        'أخبربأن': 'أخبر بأن',
        'الإلسالم': 'الإسلام',
        'الألمور': 'الأمور',
        'الأليام': 'الأيام',
        'الألسطول': 'الأسطول',
        'الألسرة': 'الأسرة',
        'أولأهل': 'أول أهل',
        'أنأ': 'أن',
        'أنعمر': 'أن عمر',
        'اهلل': 'الله',
    }
    for old, new in fixes.items():
        text = text.replace(old, new)
        
    # 3. Regex replacements using capturing groups to avoid variable-width look-behind issues
    regex_replacements = [
        (r'(^|[^\u0621-\u064A])النر ي($|[^\u0621-\u064A])', r'\1التي\2'),
        (r'(^|[^\u0621-\u064A])النن ي($|[^\u0621-\u064A])', r'\1النبي\2'),
        (r'(^|[^\u0621-\u064A])النن\s*ي($|[^\u0621-\u064A])', r'\1النبي\2'),
        (r'(^|[^\u0621-\u064A])فن ي($|[^\u0621-\u064A])', r'\1في\2'),
        (r'(^|[^\u0621-\u064A])فن($|[^\u0621-\u064A])', r'\1في\2'),
    ]
    
    for pattern, replacement in regex_replacements:
        text = re.sub(pattern, replacement, text)

    # 4. Standard symbols spacing
    text = text.replace('ﷺ', ' ﷺ ')
    text = re.sub(r' +', ' ', text)
    
    return text

def process_file(filepath):
    print(f"Processing: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    cleaned_content = clean_arabic_text(content)
    
    if content != cleaned_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(cleaned_content)
        print(f"  Fixed errors in {os.path.basename(filepath)}")

def main():
    content_dir = 'web/content'
    for filename in os.listdir(content_dir):
        if filename.endswith('.md'):
            process_file(os.path.join(content_dir, filename))

if __name__ == "__main__":
    main()
