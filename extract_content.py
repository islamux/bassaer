import fitz
import os
import re

os.makedirs('content', exist_ok=True)
doc = fitz.open('ar-basaar.pdf')

# We'll use a more flexible regex for 'الباب' followed by a number word
chapter_pattern = re.compile(r'الباب\s+(األول|الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع)')

chapter_contents = []
current_content = []

for page_num in range(len(doc)):
    page = doc.load_page(page_num)
    text = page.get_text("text")
    
    lines = text.split('\n')
    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
            
        match = chapter_pattern.search(line_clean)
        if match and len(line_clean) < 50:
            if current_content:
                chapter_contents.append(current_content)
                current_content = []
            
            # Start of a new chapter
            current_content.append("# " + line_clean)
        else:
            current_content.append(line_clean)

if current_content:
    chapter_contents.append(current_content)

# Start writing from index 0 as intro, then chapters
for i, content_lines in enumerate(chapter_contents):
    filename = 'intro.md' if i == 0 else f'chapter-{i}.md'
    filepath = os.path.join('content', filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        for line in content_lines:
            # simple heading formatting for questions
            if re.match(r'^\d+\s*-', line):
                f.write(f"\n## {line}\n\n")
            else:
                f.write(f"{line} \n")

print(f"Extraction completed! Generated {len(chapter_contents)} files.")
