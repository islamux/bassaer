#!/usr/bin/env python3
import os
import re

filepaths = [
    "/media/islamux/Variety/JavaScriptProjects/bassaer/web/content/chapter-9.md",
    "/media/islamux/Variety/JavaScriptProjects/bassaer/web/content/chapter-10.md",
    "/media/islamux/Variety/JavaScriptProjects/bassaer/web/content/chapter-11.md",
    "/media/islamux/Variety/JavaScriptProjects/bassaer/web/content/chapter-12.md",
    "/media/islamux/Variety/JavaScriptProjects/bassaer/web/content/intro.md"
]

replacements = {
    'ذفي القرنين': 'ذي القرنين',
    'ذفي': 'ذي',
    'لايُصفي': 'لا يُوصَف',
    'لايُعقل': 'لا يُعقَل',
    'لميُنقل': 'لم يُنقَل',
    'مايُتىل': 'ما يُتْلَى',
    'الذييَرُد': 'الذي يَرُد',
    'الذييُمت': 'الذي يُمَيِّز',
    'وردي سفر': 'ورد في سفر',
    'وردي كتاب': 'ورد في كتاب',
    'إلاي العربية': 'إلا في العربية',
    'إلاي أيضاً': 'إلا في أيضاً',
    'اللهي غريزة': 'الله في غريزة',
    'اللهي خلقه': 'الله في خلقه',
    'بهاي': 'بها في',
    'إليهي': 'إليه في',
    'فيهي': 'فيه في',
    'عنهايي': 'عنها في',
    'يستعمل استعماًلا': 'يستعمل استعمالاً',
    'الي يعل': 'لا يفعل',
    'وفيي': 'وفي',
    'ففيي': 'ففي',
    'فيي ': 'في ',
    'بنني': 'بني',
    'استر ق نساء': 'استرق نساء',
    'س في د بنني': 'سيد بني',
    'مَ بْناها': 'مَبْناها',
    'في ختالسماء': 'نزل من السماء' # Context: فجاء ختالسماء -> فجاء وحي السماء
}

def clean_chapters():
    total_changes = 0
    for path in filepaths:
        if not os.path.exists(path):
            continue
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        orig = content
        
        for k, v in replacements.items():
            content = content.replace(k, v)
        
        # fix: كلمةي (word ending in ي followed by a space originally meant word + " في ")
        # We must be careful! Which words usually end with ي? (الذي, في, هي, النبي, أبي, أمي, etc.)
        # What we want to target is words that DO NOT normally end with ي, like اللهي -> الله في
        content = re.sub(r'اللهي\s', 'الله في ', content)
        content = re.sub(r'الذيي\s', 'الذي في ', content)
        content = re.sub(r'الأطفلاي\s', 'الأطفال في ', content)
        content = re.sub(r'العالمي\s', 'العالم في ', content)
        content = re.sub(r'ختالسماء', 'خبر السماء', content)

        if content != orig:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            total_changes += 1

    print(f"Total files changed: {total_changes}")

if __name__ == "__main__":
    clean_chapters()
