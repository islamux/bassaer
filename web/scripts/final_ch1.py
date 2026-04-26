import re
import sys

def final_ch1_cleanup(text):
    # Fix specific recurring errors in Ch 1
    fixes = {
        r'الإلحاديّ اللغة': 'الإلحاد في اللغة',
        r'الإلحادي اللغة': 'الإلحاد في اللغة',
        r'يبال في': 'يبالي',
        r'الانحراي باب': 'الانحراف في باب',
        r'ظهرتي أوروبا': 'ظهرت في أوروبا',
        r'الدينيةي': 'الدينية في',
        r'قيمتهاي': 'قيمتها في',
        r'بالتنويري': 'بالتنوير في',
        r'التنويري. في': 'التنوير في',
        r'موسوعتهي قصة': 'موسوعته في قصة',
        r'والإيماني عينيه': 'والإيمان في عينيه',
        r'اعترفواي آخر': 'اعترفوا في آخر',
        r'الدينيي بلادنا': 'الديني في بلادنا',
        r'الإلحاديّ الغرب': 'الإلحاد في الغرب',
        r'الإلحادي الغرب': 'الإلحاد في الغرب',
        r'الديني الاصطلاحي': 'الدين بالمعنى الاصطلاحي', # heuristic
        r'الديني في الاصطلاحي': 'الدين بالمعنى الاصطلاحي',
        r'الغيبيات الت في': 'الغيبيات التي',
        r'يعن في يميلون': 'يعني يميلون',
        r'تنتقل في تفسير': 'تنتقل لتفسير', # from context
    }
    
    for pattern, replacement in fixes.items():
        text = re.sub(pattern, replacement, text)
        
    # Clean up punctuation and double spaces
    text = re.sub(r' +', ' ', text)
    text = re.sub(r' +([.،؟!:!])', r'\1', text)
    
    return text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 final_ch1.py <file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    cleaned = final_ch1_cleanup(content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print(f"Final cleanup on {file_path}")
