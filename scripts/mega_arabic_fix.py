import os
import re

def clean_arabic_text(text):
    # Fix reversed words from standard OCR glitches
    fixes = {
        'اأ': 'الأ',
        'اإ': 'الإ',
        'اآ': 'الآ',
        'اال': 'الا',
        'الال': 'اللا',
        
        # specific common words
        'األول': 'الأول',
        'اإللحاد': 'الإلحاد',
        'اإليمان': 'الإيمان',
        'اإلسالم': 'الإسلام',
        
        'إىل': 'إلى',
        'عىل': 'على',
        'حنر': 'حتى',
        'حنى': 'حتى',
        'اهلل': 'الله',
        'رسول هللا': 'رسول الله',
        
        'مُ جمَ ل': 'مُجمل',
        'تاري خ': 'تاريخ',
        
        # fix separated characters
        'ي ': 'ي ',
        'ىلي ': 'لي ',
        'فن ': 'في ',
        'ن ': 'ن ',
        
        # known fixes from clean_content
        'أختبأن': 'أخبر بأن',
        'أخت': 'أخبر',
        'ن ي هللا عنه': 'رضي الله عنه',
        'ن يهللاعنه': 'رضي الله عنه',
        'رص ي': 'رضي',
        'رص': 'رضي',
        'أ أو لُ': 'أول',
        'أو لُ': 'أول',
        'أو لِ': 'أول',
        'الألو لِين': 'الأولين',
        'لألولين': 'للأولين',
        'الألو لُ': 'الأول',
        'الألو لِ': 'الأول',
        'أ سيموتون': 'سيموتون',
        'أخبربها': 'أخبر بها',
        'أخبربه': 'أخبر به',
        'أخبربهذا': 'أخبر بهذا',
        'أخبربأن': 'أخبر بأن',
        'الألمور': 'الأمور',
        'الأليام': 'الأيام',
        'الألسطول': 'الأسطول',
        'الألسرة': 'الأسرة',
        'أولأهل': 'أول أهل',
        'أنأ': 'أن',
        'أنعمر': 'أن عمر',
        
        # reversed phrases observed
        'نماثلا نرقلا': 'القرن الثامن',
        'يرشعلا نرقلا': 'القرن العشرين',
        'يداحلا نرقلا': 'القرن الحادي',
        'ي باقع': 'في عقاب',
        'ي باب': 'في باب',
        'ي باقع': 'في عقاب',
    }
    
    # 1. basic replacements
    for old, new in fixes.items():
        text = text.replace(old, new)
        
    # 2. regex replacements for words ending with floating letters usually meaning a yeeh
    regex_replacements = [
        # fix common word boundary bugs
        (r'(^|[^\u0621-\u064A])النر ي($|[^\u0621-\u064A])', r'\1التي\2'),
        (r'(^|[^\u0621-\u064A])النن ي($|[^\u0621-\u064A])', r'\1النبي\2'),
        (r'(^|[^\u0621-\u064A])النن\s*ي($|[^\u0621-\u064A])', r'\1النبي\2'),
        (r'(^|[^\u0621-\u064A])فن ي($|[^\u0621-\u064A])', r'\1في\2'),
        (r'(^|[^\u0621-\u064A])فن($|[^\u0621-\u064A])', r'\1في\2'),
        
        # fix space before suffix letters like ين or ون 
        # (happens in words like المسلمي ن)
        (r'([\u0621-\u064A]+)\s+ن\b', r'\1ن'),  # e.g المؤمنين
        (r'([\u0621-\u064A]+)\s+ي\b', r'\1ي'),  # e.g النبي
        (r'([\u0621-\u064A]+)\s+ة\b', r'\1ة'),  # e.g الخاصة
        
        # fix floating Alef Maksura (ى)
        (r'([\u0621-\u064A]+)\s+ى\b', r'\1ى'),
        
        # Double Alif/Lam fixes from js script
        (r'الأل', r'الأ'),
        (r'الإل', r'الإ'),
        (r'رضيدنا', r'رصدنا'),
    ]
    
    for pattern, replacement in regex_replacements:
        text = re.sub(pattern, replacement, text)
        
    # JS Word based lookarounds translated
    def replace_word(word, replacement, content):
        pattern = r'(?<=^|[^\u0621-\u064A\d_])' + word + r'(?=[^\u0621-\u064A\d_]|$)'
        return re.sub(pattern, replacement, content)

    text = replace_word(r'أال', r'ألا', text)
    text = replace_word(r'إال', r'إلا', text)
    text = replace_word(r'خالل', r'خلال', text)
    text = replace_word(r'الكالم', r'الكلام', text)
    text = replace_word(r'إلثبات', r'إثبات', text)
    text = replace_word(r'ال', r'لا', text)
        
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
