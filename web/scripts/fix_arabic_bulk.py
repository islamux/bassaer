#!/usr/bin/env python3
import os
import re

CONTENT_DIR = '/media/islamux/Variety/JavaScriptProjects/bassaer-antigravity/web/content'

def clean_text(text):
    # Order: specific to general
    corrections = {
        'ضرورة الله عنه': 'رضي الله عنه',
        'ضرورة الله عنها': 'رضي الله عنها',
        'ضرورة الله عنهم': 'رضي الله عنهم',
        'ني الله': 'رضي الله',
        'ني النبي': 'رضي النبي', # less likely but safe
        'أأأم': 'أم',
        ' ففففي ': ' في ',
        ' فففي ': ' في ',
        ' ففي ': ' في ',
        'يف ': 'في ',
        ' يف': ' في',
        'الاليُبالي': 'لا يبالي',
        'اليُ بالي': 'لا يبالي',
        'تفكَّك هاظ ليلحتالاتحاد السوفينري': 'تفكك وتحلل الاتحاد السوفيتي',
        'زعنفةسمكالقرشو': 'زعنفة سمك القرش',
        'تشارلز داروينفي علم الاجتماعيُدع': 'تشارلز داروين، وفي علم الاجتماع يُدعى',
        'يأبر': 'يأتي',
        'بوّلكن ج هون': 'جون بولكينجهورن',
        'جونبولكينجهورن': 'جون بولكينجهورن',
        'سينبنني': 'سيُبنى',
        'رشع عساالتفي القرن': 'القرن التاسع عشر',
        'عشر عساالتفي': 'التاسع عشر',
        'عشر عساتلا': 'التاسع عشر',
        'القرنويدخلففي': 'القرن، ويدخل في',
        'ملا  يوجد': 'لا يوجد',
        'ن ح ط ة': 'منحطة',
        'يُس م ونها': 'يسمونها',
        'التعرفي': 'التعريف',
        'رثكأ': 'أكثر',
        'أكت ': 'أكثر ',
        'نرقلا': 'القرن',
        'عساتلا': 'التاسع',
        'تلا ': 'التي ',
        'ىلع ': 'على ',
        'نأب ': 'بأن ',
        'ينعت ': 'تعني ',
        'موهفملا': 'المفهوم',
        'يحالطصالا': 'الاصطلاحي',
        'بوّجود': 'بوجود',
        'فففي نفس.': 'في نفس ',
        'فففي إطار.': 'في إطار ',
        'فففي الغالب': 'في الغالب',
        'ففي الغالب': 'في الغالب',
        'فففي الأمر': 'في الأمر',
        'ففي الأمر': 'في الأمر',
    }
    
    for old, new in corrections.items():
        text = text.replace(old, new)
        
    # Standardize punctuation
    text = re.sub(r' +', ' ', text)
    text = text.replace(' ،', '،').replace(' .', '.').replace(' !', '!').replace(' ؟', '؟').replace(' :', ':')
    
    # Common prefixes with 'ي' instead of 'في'
    text = re.sub(r'\bي (الغالب|الأمر|العالم|هذا|كوننا|كل|مكان|التاريخ|القرن|لحظة|وجوده|قلبه|عينه|أي|بنية|نفس|إطار|حياتك|الصلاة|البداية|الوجود|المستقبل|النص|السنة|الحديث|الواقع|الغرب|الشرق|أوروبا|الطب|التطوّر|الاجتماع|علم|مجالات|إثبات|العقل|السماء|السماوات|الأرض|الكتاب|القرآن|ميكانيك)\b', r'في \1', text)
    
    # Fix repeated letters at start of word (common OCR error)
    text = re.sub(r'\b([أإاآ])\1\1(\w+)', r'\1\2', text) # أأأم -> أم
    text = re.sub(r'\b([أإاآ])\1(\w+)', r'\1\2', text) # أأم -> أم
    
    return text

def process_file(filename):
    path = os.path.join(CONTENT_DIR, filename)
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = clean_text(content)
    if content != new_content:
        with open(path, 'w', encoding='utf-8') as f: f.write(new_content)
        print(f"Cleaned {filename}")
    else:
        print(f"No changes for {filename}")

if __name__ == "__main__":
    for i in range(1, 13): process_file(f"chapter-{i}.md")
    process_file("intro.md")
