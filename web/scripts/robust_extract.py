import fitz
import os
import re

os.makedirs('/media/islamux/Variety/JavaScriptProjects/bassaer-antigravity/web/content', exist_ok=True)
doc = fitz.open('/media/islamux/Variety/JavaScriptProjects/bassaer-antigravity/add_images_plan/ar-basaar.pdf')

# Define exactly which pages start new chapters (0-indexed page numbers)
chapter_start_pages = [23, 133, 169, 278, 314, 336, 352, 398, 419, 657, 875]

chapter_contents = []
current_content = []

# Intro content before Chapter 1
for page_num in range(20, chapter_start_pages[0]):
    page = doc.load_page(page_num)
    text = page.get_text("text")
    for line in text.split('\n'):
        if line.strip():
            current_content.append(line.strip())

chapter_contents.append(current_content)

for i in range(len(chapter_start_pages)):
    start_page = chapter_start_pages[i]
    if i < len(chapter_start_pages) - 1:
        end_page = chapter_start_pages[i+1]
    else:
        end_page = len(doc)
        
    current_content = []
    for page_num in range(start_page, end_page):
        page = doc.load_page(page_num)
        text = page.get_text("text")
        for line in text.split('\n'):
            line_clean = line.strip()
            if line_clean:
                current_content.append(line_clean)
                
    chapter_contents.append(current_content)

# chapter_contents[0] is intro
# chapter_contents[1] is chapter 1, etc.

for i, content_lines in enumerate(chapter_contents):
    if i == 0:
        continue # Skip intro
    
    filename = f'chapter-{i}.md'
    filepath = os.path.join('/media/islamux/Variety/JavaScriptProjects/bassaer-antigravity/web/content', filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        # We need to format questions. In the pdf, questions are like "1 -", "2 -", etc.
        for line in content_lines:
            if re.match(r'^\d+\s*-', line):
                f.write(f"\n## {line}\n\n")
            elif line.startswith('الباب'):
                f.write(f"\n# {line}\n\n")
            else:
                f.write(f"{line} \n")

print(f"Extraction completed! Generated {len(chapter_contents)-1} chapters.")
