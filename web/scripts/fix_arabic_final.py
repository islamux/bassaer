#!/usr/bin/env python3
import os
import re

# Direct string replacements (ordered by length - longest first)
REPLACEMENTS = {
    'الديانابركانوا': 'الديانات كانوا',
    'الأنتر وبولوح ي': 'الأنثروبولوجي',
    'بالتحت التاريحني': 'بالبحث التاريخي',
    'التاريحني': 'التاريخي',
    'البيولوحي': 'البيولوجي',
    'البيولوحية': 'البيولوجية',
    'البيولوحيا': 'البيولوجيا',
    'النرضيانية': 'النصرانية',
    'فكرةا دينية': 'فكرة دينية',
    'هباءا منثورًا': 'هباءً منثوراً',
    'هباءا منثورا': 'هباءً منثوراً',
    'بناءا على': 'بناءً على',
    'تأويًلا! ٌّفاسدًايخرجه': 'تأويلاً فاسداً يخرجه',
    'التوس ل بالمستقبل': 'التوسل بالمستقبل',
    'الأكو الأمد': 'الأكوان في الأمد',
    'بتر يليونات': 'بتريليونات',
    'بالصُّدفة': 'بالصدفة',
    'عَالقة للصدفة': 'علاقة للصدفة',
    'التكلفي الإلهي': 'التكليف الإلهي',
    'التكلفي': 'التكليف',
    'املالحدة': 'الملاحدة',
    'املاديُّون': 'الماديون',
    'الأْ ُمم': 'الأمم',
    'الحفلابركانت': 'الحفلات كانت',
    'تدي نني': 'تديني',
    'انترضيت': 'انتصرت',
    'الآللهة': 'الآلهة',
    'الآلخر': 'الآخر',
    'ب الد نا': 'بلادنا',
    'حلالا بالبديهة': 'حلالاً بالبديهة',
    'ماليين': 'ملايين',
    'المخ تلفة': 'المختلفة',
    'تمأل': 'تملأ',
    'عت كل التاريخ': 'عبر كل التاريخ',
    'عت كل الجغرافيا': 'عبر كل الجغرافيا',
    'عت كل الزمان': 'عبر كل الزمان',
    'عت تاريخ كل الأنبياء': 'عبر تاريخ كل الأنبياء',
    'عت كل العصور': 'عبر كل العصور',
    'عت التاريخ': 'عبر التاريخ',
    'عت العصوري': 'عبر العصور في',
    'عت العصري': 'عبر العصور في',
    'عت ْ كل التاريخ': 'عبر كل التاريخ',
    'عت ْ كل العصور': 'عبر كل العصور',
    'عت ْ العصوري': 'عبر العصور في',
    'عتي ام': 'على ما',
    'انِسُفْنأ': 'أنفسنا',
    'ُدِجَن': 'نجد',
    'اَّنإ': 'إنا',
    'ُهوُلَأَسَف': 'فسألوه',
    'كفي ': 'كيف ',
    ' فكفي ': ' فكيف ',
    'وكفي ': 'وكيف ',
    'بأن كشىي': 'بأن كسرى',
    'كشىي': 'كسرى',
    'إشائيل': 'إسرائيل',
    'الت دية': 'البردية',
    'عتَي': 'على',
    'هاي ': 'هي ',
    'هاي': 'هي',
    'أسماءا': 'أسماءً',
    'قربي': 'قربة',
    'اليَلفت': 'لا يلفت',
    'الاطراد': 'الاضطراد',
    'الكتشاف': 'اكتشاف',
    'هفي ': 'فهي ',
    'هف في ': 'فهي في ',
    '؛،': '؛ ',
    '؛، ': '؛ ',
    '!ننظر': ' ننظر!',
    '!يُقدم': ' يُقدم!',
    '!خطورةً': ' خطورةً!',
    '!ليُغري': ' ليُغري!',
    '!الصاعد': ' الصاعد!',
    '!ننظر': ' ننظر!',
    'اللاأدر في': 'اللاأدري',
    'اللاأدري': 'اللاأدري',
    'بالتال في': 'بالتالي',
}
    'أتفر من ا': 'أتقى منا',
    'أتقى من ا': 'أتقى منا',
    'أحضر الناس': 'أحرص الناس',
    'أحضر على': 'أحرص على',
    'رضيي ح الإيمان': 'صريح الإيمان',
    'الماص': 'الماضي',
    'الطني': 'الطبي',
    'التوصفي': 'التوصيف',
    'النفشي': 'النفسي',
    'عَ ل ُّ': 'علم',
    'التقصت': 'التقصير',
    'لخبرنا': 'لخيرنا',
    'لختنا': 'لخيرنا',
    'يلتر نم': 'يلتزم',
    'يلترنم': 'يلتزم',
    'بمنته ': 'بمنتهى ',
    'بمنته': 'بمنتهى',
    'النهية': 'النهاية',
    'تبنن': 'تبنى',
    'ب عدًا': 'بعداً',
    'ب عدا': 'بعداً',
    'الي حبذون': 'لا يحبذون',
    'الي حبّذون': 'لا يحبذون',
    'اليُفسر': 'لا يفسر',
    'اليُنتج': 'لا ينتج',
    'اليُعرف': 'لا يعرف',
    'اليُمكن': 'لا يمكن',
    'دُ عاة': 'دعاة',
    'دُ عاة!': 'دعاة!',
    'دُ وَل': 'دول',
    'ب عد ': 'بعد ',
    'ب عد.': 'بعد.',
    'ب عد،': 'بعد،',
    'ب عد!': 'بعد!',
    'ب عد؟': 'بعد؟',
    'ب عد': 'بعد',
    'الآللهة': 'الآلهة',
    'الآلخر': 'الآخر',
    'الآلليات': 'الآليات',
    'الآللية': 'الآلية',
    'الآلالف': 'الآلاف',
    'آلالف': 'آلاف',
    'الآلم': 'الألم',
    'الآلماني': 'الألماني',
    'الآلسيوية': 'الآسيوية',
    'تاري خ': 'تاريخ',
    'التاري خ': 'التاريخ',
    'تاريخي': 'تاريخي',
    'التاريخي': 'التاريخي',
    'الاصطالحي': 'الاصطلاحي',
    'الشهرستابن': 'الشهرستاني',
    'القرن الثامنبداية': 'القرن الثامن، بداية',
    'القرن العشرينومع': 'القرن العشرين، ومع',
    'القرن الحاديومع': 'القرن الحادي والعشرين، ومع',
    'القرن العشر ين': 'القرن العشرين',
    'بالدنا': 'بلادنا',
    'القهرفي': 'القهري في',
    'مرحلةي': 'مرحلة في',
    'سيختفيي': 'سيختفي',
    'تاليةفي': 'تالية في',
    'فولتيرفي': 'فولتير في',
    'لخدمه فولتير': 'لخدمة فولتير',
    'واد ع': 'وادعى',
    'مُ خص صة': 'مخصصة',
    'بانتظام فنحن': 'بانتظام، فنحن',
    'الديني مرحلةي': 'الدين في مرحلة في',
    'العشائر في بالطوطم': 'العشائر في الطوطم',
    'الطوطمي': 'الطوطم في',
    'وربهن الدين في': 'وربه، فالدين في',
    'فمم ا': 'فمما',
    'أ...ي الأصل': 'أن الدين في الأصل',
    'نهية': 'نهاية',
    'النهية': 'النهاية',
    'اللاتزام': 'الالتزام',
    'للتطبي ع': 'للتطبيع',
    'التبتير': 'التبرير',
    'ت تخلاف': 'تخالف',
    'تخلاف': 'تخالف',
    'ت تير': 'تبرير',
    'البيئية': 'البيئة',
    'ل مَ ا': 'لما',
    'ل م ا': 'لما',
    'باعثُ': 'باعث',
    'بالجت ية': 'بالجبرية',
    'جت ية': 'جبرية',
    'مُ جت': 'مجبراً',
    'البروتينات': 'البروتينات',
    'البروتين': 'البروتين',
}

# Sorting by length descending to avoid partial matches
SORTED_REPLACEMENTS = sorted(REPLACEMENTS.items(), key=lambda x: len(x[0]), reverse=True)

def fix_content(content):
    # Apply direct replacements first
    for old, new in SORTED_REPLACEMENTS:
        content = content.replace(old, new)
    
    # Clean up multiple tanwins
    content = re.sub(r'اً+', 'اً', content)
    content = re.sub(r'اً+', 'اً', content) # Double check for different types of tanwin
    content = re.sub(r'ً+', 'ً', content)
    
    # Fix 'ي' standing for 'في'
    content = re.sub(r'الشيوعيةي', 'الشيوعية في', content)
    content = re.sub(r'مرحلةي', 'مرحلة في', content)
    content = re.sub(r'الطوطمي', 'الطوطم في', content)
    content = re.sub(r'الديني', 'الدين في', content)
    content = re.sub(r'فقط،في', 'فقط في', content)
    content = re.sub(r'فولتيرفي', 'فولتير في', content)
    content = re.sub(r'تاليةفي', 'تالية في', content)
    content = re.sub(r'بالدنا', 'بلادنا', content)
    
    # Specific common ones where 'ي' is used instead of 'في'
    content = re.sub(r'\bف ي\b', 'في', content)
    content = re.sub(r'\bي\b', 'في', content) # Handle standalone 'ي' as 'في' if context allows
    # But wait, standalone 'ي' might be part of a list or something.
    # Let's check common occurrences of standalone 'ي'.
    
    # Undoing damage from aggressive regex
    content = re.sub(r'ف في', 'في', content)
    content = re.sub(r'ه في', 'هي', content)
    content = re.sub(r'أ في', 'أي', content)
    content = re.sub(r'بالتال في', 'بالتالي', content)
    content = re.sub(r'عقل في', 'عقلي', content)
    content = re.sub(r'أقنوم في', 'أقنومي', content)
    content = re.sub(r'اللاأدر في', 'اللاأدري', content)
    content = re.sub(r'اللاأدري', 'اللاأدري', content) # Ensure correct form
    content = re.sub(r'هكسل في', 'هكسلي', content)
    content = re.sub(r'الفيزيائ في', 'الفيزيائي', content)
    content = re.sub(r'الماض في', 'الماضي', content)
    content = re.sub(r'البشر في', 'البشري', content)
    content = re.sub(r'الوثن في', 'الوثني', content)
    content = re.sub(r'الدين فية', 'الدينية', content)
    content = re.sub(r'البيولوج في', 'البيولوجي', content)
    content = re.sub(r'الاقتصاد في', 'الاقتصادي', content)
    content = re.sub(r'أيد في', 'أيدي', content)
    content = re.sub(r'تأو في', 'تأوي', content)
    content = re.sub(r'السخف في', 'السخيف', content)
    content = re.sub(r'أحر في', 'أحرى', content) # or 'أحرص'?
    
    # Fix spacing issues
    content = re.sub(r'(\w) (\w) (\w) (\w) (\w)', r'\1\2\3\4\5', content)
    content = re.sub(r'(\w) (\w) (\w) (\w)', r'\1\2\3\4', content)
    
    # Re-apply some replacements after spacing fix
    for old, new in SORTED_REPLACEMENTS:
        content = content.replace(old, new)

    # Specific common ones
    content = re.sub(r'ت وتين', 'بروتين', content)
    content = re.sub(r'البيولوح', 'البيولوج', content)
    content = re.sub(r'الإسالم', 'الإسلام', content)
    content = re.sub(r'لإلسالم', 'للإسلام', content)
    content = re.sub(r'لإللحاد', 'للإلحاد', content)
    content = re.sub(r'لإليمان', 'للإيمان', content)
    content = re.sub(r'لإلنسان', 'للإنسان', content)
    content = re.sub(r'عىل', 'على', content)
    content = re.sub(r'إىل', 'إلى', content)
    
    # Fix duplicated characters from regex above
    content = re.sub(r'ىى+', 'ى', content)
    content = re.sub(r'أأ+', 'أ', content)
    
    return content

def main():
    content_dir = 'content'
    for filename in os.listdir(content_dir):
        if filename.endswith('.md'):
            filepath = os.path.join(content_dir, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                    content = f.read()
            
            new_content = fix_content(content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Fixed {filename}')
            else:
                print(f'No changes in {filename}')

if __name__ == '__main__':
    main()
