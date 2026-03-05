import fitz
import sys

# Ensure stdout handles Arabic properly
sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open('ar-basaar.pdf')

for page_num in range(min(20, len(doc))):
    page = doc.load_page(page_num)
    text = page.get_text()
    print(f"--- Page {page_num + 1} ---")
    print(text.strip())
