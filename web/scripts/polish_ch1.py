import re
import sys

def very_final_ch1_polish(text):
    # Specific complex fixes for leftover anomalies
    fixes = {
        r'الحاد في والعشرين': 'الحادي والعشرين',
        r'الاقتصاد في': 'الاقتصادي',
        r'التنظير الاقتصاد في': 'التنظير الاقتصادي',
        r'الدين في الاصطلاحي': 'الدين بالمعنى الاصطلاحي',
        r'التنظير البيولوجي في': 'التنظير البيولوجي',
        r'التنظير الفعل في': 'التنظير الفعلي',
        r'الفعل في للإلحاد': 'الفلي للإلحاد',
        r'ي المجتمع الشيوعيي': 'في المجتمع الشيوعي',
        r'فسيختفيي': 'فسيختفي',
        r'الوجه القبيح للعنصريةي': 'الوجه القبيح للعنصرية في',
        r'ب الإلحاد العلمي ': 'باسم "الإلحاد العلمي" ',
        r'المعنى الأوحدي': 'المعنى الأوحد في',
        r'وجرو داورين': 'وجرو داروين',
        r'وثن ات خذ': 'وثن اتخذ',
        r'فالإلحادي!': 'فالإلحاد في!',
        r'الخالق العالم الق 8\)': 'الخالق العالم القديم (8)',
        r'مرحلةي المجتمع': 'مرحلة في المجتمع',
        r'تاليةي ذاك': 'تالية في ذاك',
    }
    
    for pattern, replacement in fixes.items():
        text = re.sub(pattern, replacement, text)
        
    return text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 polish_ch1.py <file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    cleaned = very_final_ch1_polish(content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print(f"Polished {file_path}")
