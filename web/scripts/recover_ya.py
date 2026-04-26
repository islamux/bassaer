import re
import sys

def recover_ya(text):
    # Fix 'ي' that was incorrectly separated into ' في'
    # List of known words that end in 'ي' in this context
    ya_words = [
        'ينتهي', 'التالي', 'السعدي', 'الهيوماني', 'الربوبي', 'وبالتالي', 'تعني', 
        'البشري', 'الميلادي', 'يسترشي', 'يسترشد', 'لقرابة', 'لخانتني', 'سرقتني',
        'العالمي', 'المادي', 'يعني', 'القومي', 'الفلسفي', 'الديني', 'النبوية',
        'الغربي', 'الشرقي', 'الإلحادي', 'اللاديني', 'المتوفى', 'الخاتمي',
        'الشرعي', 'القهري', 'الظاهري', 'الوسواسي', 'عقلي', 'خادمي', 'زوجتي',
        'أرشدني', 'ساعدني', 'يسعني', 'ربي', 'فمني', 'الشيطاني', 'أدعي',
        'هزيلة', 'ضعيفة', 'واحدة', 'الميسر', 'السعد', 'النسائي', 'صحيح',
        'التنوير', 'فولتير', 'يُبالي', 'لاأدريني', 'اللاأدري',
    ]
    
    for word in ya_words:
        # If the word is like 'البشر في' or 'البشر في ' -> 'البشري'
        # Handle cases where the last letter might be missing from the stem in the list
        stem = word[:-1]
        suffix = word[-1]
        if suffix == 'ي':
            # Check for "stem + في" or "stem +  في" or "stem + ي"
            text = re.sub(rf'\b{stem} في\b', word, text)
            text = re.sub(rf'\b{stem} ي\b', word, text)
            
    # Fix specific mis-fixes
    text = re.sub(r'يعن في', 'يعني', text)
    text = re.sub(r'الهيومان في', 'الهيوماني', text)
    text = re.sub(r'الربوب في', 'الربوبي', text)
    text = re.sub(r'وبالتال في', 'وبالتالي', text)
    text = re.sub(r'تاريخ الجنس البشر في', 'تاريخ الجنس البشري', text)
    text = re.sub(r'تعن في', 'تعني', text)
    text = re.sub(r'ينته في', 'ينتهي', text)
    text = re.sub(r'التال في', 'التالي', text)
    text = re.sub(r'السعد في', 'السعدي', text)
    text = re.sub(r'البشر في', 'البشري', text)
    text = re.sub(r'بالنسبة لتاريخ الجنس البشر في', 'بالنسبة لتاريخ الجنس البشري', text)
    text = re.sub(r'الموجة الإلحاد في ة', 'الموجة الإلحادية', text)
    text = re.sub(r'لخانتن في', 'لخانتني', text)
    text = re.sub(r'سرقن في', 'سرقتني', text)
    text = re.sub(r'الوسي ف ال', 'الوسيلة', text) # just guessing
    
    return text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 recover_ya.py <file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    recovered = recover_ya(content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(recovered)
    print(f"Recovered {file_path}")
