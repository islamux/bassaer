#!/usr/bin/env python3
import os
import re

def proofread_chapters():
    content_dir = "/media/islamux/Variety/JavaScriptProjects/bassaer/web/content"
    chapters = ["chapter-1.md", "chapter-2.md", "chapter-3.md", "chapter-4.md"]
    
    replacements = {
        'اللالأدري': 'اللاأدري',
        'اللالأدرية': 'اللاأدرية',
        'بوّجود': 'بوجود',
        'كلامُ عط لة': 'كالمعطلة',
        'الإلحادي اللغة': 'الإلحاد في اللغة',
        'لِّسَانُ لاَّذِفييُلْحِدُونَ': 'لِّسَانُ الَّذِي يُلْحِدُونَ',
        'إِلَفيْهِ': 'إِلَيْهِ',
        'أَعْجَمِفيٌّ': 'أَعْجَمِيٌّ',
        'المَفيْل': 'المَيْل',
        'اعترفواي آخر': 'اعترفوا في آخر',
        'الإيماني عينيه': 'الإيمان في عينيه',
        'فهذاي حال': 'فهذا في حال',
        'في كتاب': 'في كتاب',
        'في الكون': 'في الكون',
        'في الغرب': 'في الغرب',
        'في الشرق': 'في الشرق',
        'في أوروبا': 'في أوروبا',
        'في أصلها': 'في أصلها',
        'آندرو النج': 'آندرو لانج',
        'الإشكال ا فيي الكون': 'الإشكال الأول: كيف يكون النظر في الكون',
        'الإشكال ا إن استمرار': 'الإشكال الثاني: إن استمرار',
        'الإشكال ا في إطلاقًا': 'الإشكال الثالث: إطلاقًا',
        'Anthropologyي تاريخ': 'Anthropology في تاريخ',
        'يُستحدَث': 'يستحدث',
        'فيي ': 'في ',
        'يكيفي': 'يكفي',
        'تكيفي': 'تكفي',
        # Fix the isolated ' ي '
    }

    total_changes = 0

    for ch in chapters:
        path = os.path.join(content_dir, ch)
        if not os.path.exists(path):
            continue
            
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        orig = content

        for old, new in replacements.items():
            content = content.replace(old, new)

        # Isolated ' ي ' -> ' في '
        content = re.sub(r'(?<=\s)ي(?=\s)', 'في', content)
        # Fix 'ي ' at the end of a word where context means 'في'
        content = content.replace('ي الغالب', 'في الغالب')
        
        if content != orig:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed OCR errors in {ch}")
            total_changes += 1

    print(f"Completed proofreading. Modified {total_changes} files.")

if __name__ == '__main__':
    proofread_chapters()
