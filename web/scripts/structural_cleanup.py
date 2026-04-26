import re
import os

def cleanup_arabic_text(text):
    # 1. Remove OCR junk strings
    def is_junk(match):
        s = match.group(0)
        diacritics = len(re.findall(r'[َُِّّّ]', s))
        if diacritics >= 2 and len(s) >= 6: return True
        # If it consists of letters that are commonly repeated in OCR noise
        if re.search(r'^[بتنثريىكلكم]{6,}$', s): return True
        # Common sequences
        junk_patterns = ['كمكىكيلم', 'غمفجفحفخ', 'مجمحمخ', 'ضحضخ', 'ظمعجعم', 'فجفحفخ', 'قمكجكح', 'لجلحلخ', 'تنتىتيثرثز']
        for p in junk_patterns:
            if p in s: return True
        if len(s) > 12: return True
        return False

    text = re.compile(r'[َُِّّّ\u0621-\u064A]{6,}').sub(lambda m: '' if is_junk(m) else m.group(0), text)

    # 2. Specific merged fixes
    merged_fixes = {
        'صلىالله': 'صلى الله',
        'عليهوسلم': 'عليه وسلم',
        'رضيالله': 'رضي الله',
        'سبحانهوتعالى': 'سبحانه وتعالى',
        'عزوجل': 'عز وجل',
        'فيأن': 'في أن',
        'بأن': 'بأن ',
        'لقدتبين': 'لقد تبين',
        'ففي': 'ففي ',
    }
    for old, new in merged_fixes.items():
        text = text.replace(old, new)

    # 3. Clean up standalone noise
    text = re.sub(r'\s+[َُِّّّ]{1,3}\s+', ' ', text)
    
    # 4. Remove empty ornate parentheses or those containing only dots/spaces
    text = re.sub(r'﴾[\s\.\،]*﴿', '', text)
    text = re.sub(r'﴿[\s\.\،]*﴾', '', text)
    
    # 5. Fix double spaces
    text = re.sub(r' +', ' ', text)

    return text

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = cleanup_arabic_text(content)
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Cleaned up {file_path}")

if __name__ == "__main__":
    content_dir = "content"
    for filename in os.listdir(content_dir):
        if filename.endswith(".md"):
            process_file(os.path.join(content_dir, filename))
