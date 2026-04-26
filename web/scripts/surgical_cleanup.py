import re
import sys

def surgical_cleanup(text):
    # Standardize spaces and punctuation
    text = re.sub(r' +', ' ', text)
    text = re.sub(r' +([.،؟!:!])', r'\1', text)
    
    # Fix broken 'ً ا'
    text = re.sub(r'([ا-ي])ً ا', r'\1ًا', text)
    
    # Fix broken 'في' patterns
    # These are specific junctions where 'في' merged as 'ي'
    text = re.sub(r'([ا-ي]{2,}[تفهندرلب])ي ([ا-ي]{2,})', r'\1 في \2', text)
    text = re.sub(r'([ا-ي]{2,})ففي', r'\1 في', text)
    text = re.sub(r'([ا-ي]{2,})ف في', r'\1 في', text)

    # Fix broken word fragments (common in Ch 1)
    # 1. 'ا لـ' at start of words
    text = re.sub(r'\bا ل([ا-ي]{2,})', r'ال\1', text)
    # 2. Split words like 'الإلحاد'
    text = re.sub(r'اإل لحاد', 'الإلحاد', text)
    text = re.sub(r'األ خرى', 'الأخرى', text)
    
    # 3. Specific common Ch 1 fragments
    text = re.sub(r'وه وي ', 'وهو في ', text)
    text = re.sub(r'اعترفواي ', 'اعترفوا في ', text)
    text = re.sub(r'كلامعطلة', 'كالمعطلة', text)
    text = re.sub(r'يؤمنبوجود', 'يؤمن بوجود', text)
    text = re.sub(r'بالتنويري ', 'بالتنوير في ', text)
    text = re.sub(r'قيمتهاي ', 'قيمتها في ', text)
    
    # Line starts with colon
    text = re.sub(r'\n:([ا-ي])', r' \1', text)

    # Fix 'ي' at end of words followed by numbers or parentheses
    text = re.sub(r'([ا-ي]{2,})ي (\d+|\()', r'\1 في \2', text)

    return text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 surgical_cleanup.py <file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    cleaned = surgical_cleanup(content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print(f"Cleaned {file_path}")
