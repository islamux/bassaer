#!/usr/bin/env python3
import os
import re
import unicodedata
from pathlib import Path

CONTENT_DIR = Path('content')

def normalize_text(content):
    # Standardize Unicode
    content = unicodedata.normalize('NFKC', content)
    # Fix specific common "Allah" ligature variants
    content = content.replace('اهلل', 'الله')
    return content

def fix_arabic_artifacts(content):
    fixes = {
        ' براهي ن': ' براهين',
        'براهي ن ': 'براهين ',
        ' براهي  ن': ' براهين',
        ' ت اهي ن': ' براهين',
        'المسلمي ن': 'المسلمين',
        'المرسلي ن': 'المرسلين',
        'الالنسان': 'اللاإنسان',
        ' األنبياء': ' الأنبياء',
        ' األ مة': ' الأمة',
        ' األجَ ل': ' الأجل',
        ' األج ُل': ' الأجل',
        ' األ طياف': ' الأطياف',
        ' االنتهاء': ' الانتهاء',
        ' االنتباه': ' الانتباه',
        ' االقتباس': ' الاقتباس',
        ' اإللحاد': ' الإلحاد',
        ' اإلسالم': ' الإسلام',
        ' اإلنسانية': ' الإنسانية',
        ' اإليمان': ' الإيمان',
        'االنتقاء': 'الانتقاء',
        'االرتقاء': 'الارتقاء',
        'االعتقاد': 'الاعتقاد',
        'االستدالل': 'الاستدلال',
        'االحتجاج': 'الاحتجاج',
        'االستسالم': 'الاستسلام',
        'االلتزام': 'الالتزام',
        'االنقياد': 'الانقياد',
        'االمتثال': 'الامتثال',
        'االعتراف': 'الاعتراف',
        'االختيار': 'الاختيار',
        'االنتساب': 'الانتساب',
        'االستخدام': 'الاستخدام',
        'االستماع': 'الاستماع',
        'االنتشار': 'الانتشار',
        'االنتفاع': 'الانتفاع',
        'االنتهاء': 'الانتهاء',
        'المشر وع': 'المشروع',
        ' المشروع': ' المشروع',
        'معابن': 'معاني',
        'أ ح ق ق': 'أحقق',
        'أ ق د م ه': 'أقدمه',
        'أ ؤ ل ف': 'أؤلف',
        'نش ر ئ': 'نشأ',
        'النن ي': 'النبي',
        'النر ي': 'التي',
        'فن ي': 'في',
        'حواىلي': 'حوالي',
        'إال': 'إلا',
        'إىل': 'إلى',
        'عىل': 'على',
        'هؤالء': 'هؤلاء',
        'ألنه': 'لأنه',
        'ألبن': 'لأن',
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
        'مباشر ةا': 'مباشرةً',
        'مباشرة ا': 'مباشرةً',
        'عشر ة': 'عشرة',
        'كثت ة': 'كثيرة',
        'كبت ة': 'كبيرة',
        'بصت ة': 'بصيرة',
        'موس عاً': 'موسعاً',
        'بفضل هللا': 'بفضل الله',
        'بسم هللا': 'بسم الله',
        'الحمد هللل': 'الحمد لله',
        'الحمد هلل': 'الحمد لله',
        'باهلل': 'بالله',
        'ر ئ ': 'رأى ',
        'ُت ر ئ': 'تنشأ',
        'ُت ر ئ': 'تنشأ',
        'ر ئ الفروع': 'رأى الفروع',
        'نشأ الفروع': 'نشأ الفروع',
        'أدركت أن': 'أدركت أن',
        'ألبن الفروع': 'لأن الفروع',
        'نش ئ': 'نشأ',
        'ٹ': '',
        'ٱ': '',
        'ٹٱ': '',
    }
    
    for old, new in fixes.items():
        content = content.replace(old, new)
        
    # More aggressive regex for 'Ya' at end of words that got split
    content = re.sub(r'([\u0621-\u064A]{2,})\s+ي\b', r'\1ي', content)
    content = re.sub(r'([\u0621-\u064A]{2,})\s+ن\b', r'\1ن', content)
    content = re.sub(r'([\u0621-\u064A]{2,})\s+ة\b', r'\1ة', content)
    
    # Fix Waw and Fa prefixes
    content = re.sub(r'\bو\s+([\u0621-\u064A])', r'و\1', content)
    content = re.sub(r'\bف\s+([\u0621-\u064A])', r'ف\1', content)
    
    # Remove stand-alone numbers (often page numbers)
    content = re.sub(r'^\s*\d+\s*$', '', content, flags=re.MULTILINE)
    
    # Final cleanup of extra spaces
    content = re.sub(r' +', ' ', content)
    
    return content

def process_file(file_path):
    print(f"Processing {file_path.name}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    content = normalize_text(content)
    content = fix_arabic_artifacts(content)
    
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
    print(f"\nRefinement pass complete. Updated {count} files.")

if __name__ == "__main__":
    main()
