import fitz
import os
import re

PDF_PATH = '/media/islamux/Variety/JavaScriptProjects/bassaer/add_images_plan/ar-basaar.pdf'
OUTPUT_FILE = 'content/intro.md'

if not os.path.exists(PDF_PATH):
    print(f"Error: PDF not found at {PDF_PATH}")
    exit(1)

doc = fitz.open(PDF_PATH)

intro_content = []
# Pages 20 to 22 (0-indexed) are intro according to robust_extract.py logic
# Let's be generous and check 19 to 23 to make sure we don't miss anything
for page_num in range(19, 23):
    page = doc.load_page(page_num)
    text = page.get_text("text")
    for line in text.split('\n'):
        if line.strip():
            intro_content.append(line.strip())

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write("# مقدمة الكتاب\n\n")
    for line in intro_content:
        # Check if line is a sub-header (e.g., "لماذا هذا المشروع")
        if "لماذا هذا المشروع" in line or "من هي الفئة المستهدفة" in line:
            f.write(f"\n## {line}\n\n")
        elif line.startswith('فهرس'):
             f.write(f"\n### {line}\n\n")
        else:
             f.write(f"{line} \n")

print(f"Intro successfully extracted and written to {OUTPUT_FILE}")
