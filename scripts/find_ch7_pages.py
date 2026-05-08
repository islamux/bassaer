import fitz
import re

doc = fitz.open('../add_images_plan/ar-basaar.pdf')
chapter_7_start = -1
chapter_8_start = -1

for page_num in range(100, len(doc)):
    page = doc.load_page(page_num)
    text = page.get_text("text")
    if "تفكيك الشبهة" in text:
        print(f"Chapter 7 Title mentioned on page {page_num + 1}")
    if "الوسواس القهري" in text:
        print(f"Chapter 8 Title mentioned on page {page_num + 1}")
        break

print(f"Suggested range for Chapter 7: {chapter_7_start + 1} to {chapter_8_start}")
