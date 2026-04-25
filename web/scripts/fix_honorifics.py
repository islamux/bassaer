#!/usr/bin/env python3
import os
import re
from pathlib import Path

def fix_honorifics():
    content_dir = Path('/media/islamux/Variety/JavaScriptProjects/bassaer-antigravity/web/content')
    md_files = list(content_dir.glob('*.md'))

    patterns = [
        # Catch common corruptions
        (r'ضرورة(\s+الله\s+عن(?:ه|ها|هم|هما|كن|كم))', r'رضي\1'),
        (r'ضرورة(\s+عن(?:ه|ها|هم|هما|كن|كم))', r'رضي\1'),
        (r'رضي الله ضرورة عن(ه|ها|هم|هما)', r'رضي الله عن\1'),
        (r'قال ضرورة', r'قال رضي الله عنه'),
        # specific corruptions in the text
        (r'ضرورة عنهما قال ضرورة', r'رضي الله عنهما قال'),
        (r'سار ها ضرورة،', r'سار ها بشيء،'),
        (r'ضرورة ح به', r'صرح به'), # "ضرورة ح به علماء الأنثروبولوجيا" -> "صرح به"
        (r'النضرورة', r'النصر'), # "وتنتضرورة" -> "وتنتصر", "سورة النضرورة" -> "سورة النصر"
        (r'تنتضرورة', r'تنتصر'),
        (r'الخضرورة', r'الخضر'), # "الخضرورة لسيدنا موش" -> "الخضر"
        (r'مضرورة', r'مصر'), # "مضرورة وقال لهم" -> "مصر", "في مضرورة" -> "في مصر"
        (r'يُحضرورة', r'يُحصر'), # "ضخ إعلامي رهيب يُحضرورة" -> "يُحصر"
        (r'يحضرورة', r'يحصره'),
        (r'الضرورةع', r'المصروع'), # "المصاب بالضرورةع" -> "المصاب بالصرع"
        (r'قيرضي', r'قيصر'), 
    ]

    total_fixes = 0
    for file_path in md_files:
        content = file_path.read_text(encoding='utf-8')
        orig_content = content
        
        for p, r in patterns:
            content = re.sub(p, r, content)
            
        if content != orig_content:
            file_path.write_text(content, encoding='utf-8')
            print(f"Fixed honorifics/errors in {file_path.name}")
            total_fixes += 1

    print(f"Total files fixed: {total_fixes}")

if __name__ == '__main__':
    fix_honorifics()
