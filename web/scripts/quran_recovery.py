import re
import os
import requests
import json

# Surah name to number mapping
SURAH_MAP = {
    "الفاتحة": 1, "البقرة": 2, "آل عمران": 3, "النساء": 4, "المائدة": 5, "الأنعام": 6, "الأعراف": 7, "الأنفال": 8,
    "التوبة": 9, "يونس": 10, "هود": 11, "يوسف": 12, "الرعد": 13, "إبراهيم": 14, "الحجر": 15, "النحل": 16,
    "الإسراء": 17, "الكهف": 18, "مريم": 19, "طه": 20, "الأنبياء": 21, "الحج": 22, "المؤمنون": 23, "النور": 24,
    "الفرقان": 25, "الشعراء": 26, "النمل": 27, "القصص": 28, "العنكبوت": 29, "الروم": 30, "لقمان": 31, "السجدة": 32,
    "الأحزاب": 33, "سبأ": 34, "فاطر": 35, "يس": 36, "الصافات": 37, "ص": 38, "الزمر": 39, "غافر": 40, "فصلت": 41,
    "الشورى": 42, "الزخرف": 43, "الدخان": 44, "الجاثية": 45, "الأحقاف": 46, "محمد": 47, "الفتح": 48, "الحجرات": 49,
    "ق": 50, "الذاريات": 51, "الطور": 52, "النجم": 53, "القمر": 54, "الرحمن": 55, "الواقعة": 56, "الحديد": 57,
    "المجادلة": 58, "الحشر": 59, "الممتحنة": 60, "الصف": 61, "الجمعة": 62, "المنافقون": 63, "التغابن": 64,
    "الطلاق": 65, "التحريم": 66, "الملك": 67, "القلم": 68, "الحاقة": 69, "المعارج": 70, "نوح": 71, "الجن": 72,
    "المزمل": 73, "المدثر": 74, "القيامة": 75, "الإنسان": 76, "المرسلات": 77, "النبأ": 78, "النازعات": 79,
    "عبس": 80, "التكوير": 81, "الانفطار": 82, "المطففين": 83, "الانشقاق": 84, "البروج": 85, "الطارق": 86,
    "الأعلى": 87, "الغاشية": 88, "الفجر": 89, "البلد": 90, "الشمس": 91, "الليل": 92, "الضحى": 93, "الشرح": 94,
    "التين": 95, "العلق": 96, "القدر": 97, "البينة": 98, "الزلزلة": 99, "العاديات": 100, "القارعة": 101,
    "التكاثر": 102, "العصر": 103, "الهمزة": 104, "الفيل": 105, "قريش": 106, "الماعون": 107, "الكوثر": 108,
    "الكافرون": 109, "النصر": 110, "المسد": 111, "الإخلاص": 112, "الفلق": 113, "الناس": 114
}

def get_ayah_text(surah_num, ayah_num):
    try:
        url = f"https://api.alquran.cloud/v1/ayah/{surah_num}:{ayah_num}/ar.clean"
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()['data']['text']
    except Exception as e:
        print(f"Error fetching ayah {surah_num}:{ayah_num} - {e}")
    return None

def normalize_arabic_numbers(text):
    arabic_to_western = {
        '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
        '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    }
    for a, w in arabic_to_western.items():
        text = text.replace(a, w)
    return text

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern: [OCR Junk] ﴿? [Verse Num] ﴾? [Surah Name]
    # Example: ُّضحضخضمطحظمعجعمغجغم فجفحفخفمقح قمكجكحكخكل كملجلحلخلم لهمج َّ ﴾ 14٠. ﴾ سورة النساء
    # Sometimes it's spread across lines or has dots.
    
    # regex to find potential markers
    # We look for "سورة [Name]" and work backwards to find a number.
    pattern = re.compile(r'(?:[َُّّ\s\w\.]*)\s*(?:﴾|﴿)?\s*(\d+٠?)\s*(?:﴾|﴿)?\s*(?:\.|،)?\s*(?:﴾|﴿)?\s*سورة\s+([^\s\.\)\(﴾﴿]+)')
    
    def replace_verse(match):
        full_match = match.group(0)
        ayah_num_str = normalize_arabic_numbers(match.group(1))
        surah_name = match.group(2).strip()
        
        if surah_name in SURAH_MAP:
            surah_num = SURAH_MAP[surah_name]
            ayah_num = int(ayah_num_str)
            print(f"Found: {surah_name} {ayah_num}")
            
            ayah_text = get_ayah_text(surah_num, ayah_num)
            if ayah_text:
                return f"﴾ {ayah_text} ﴿ ﴾ سورة {surah_name} {ayah_num} ﴿"
        
        return full_match

    # More aggressive pattern for the junk before the surah marker
    # Pattern: (OCR GIBBERISH) َّ ﴾ [NUM] . ﴾ سورة [NAME]
    pattern_aggressive = re.compile(r'[\u0600-\u06FF\s]*َّ\s*(?:﴾|﴿)?\s*([\d٠-٩]+)\s*(?:﴾|﴿)?\s*(?:\.|،)?\s*(?:﴾|﴿)?\s*سورة\s+([^\s\.\)\(﴾﴿]+)')

    new_content = pattern_aggressive.sub(replace_verse, content)
    
    # Handle the cases where the junk is just a string of connected Arabic glyphs
    # like "ُّضحضخضمطحظمعجعمغجغم"
    glyph_junk_pattern = re.compile(r'[َُّّ\u0621-\u064A]{10,}\s*(?:﴾|﴿)?\s*([\d٠-٩]+)\s*(?:﴾|﴿)?\s*(?:\.|،)?\s*(?:﴾|﴿)?\s*سورة\s+([^\s\.\)\(﴾﴿]+)')
    new_content = glyph_junk_pattern.sub(replace_verse, new_content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

if __name__ == "__main__":
    content_dir = "content"
    for filename in os.listdir(content_dir):
        if filename.endswith(".md"):
            print(f"Processing {filename}...")
            process_file(os.path.join(content_dir, filename))
