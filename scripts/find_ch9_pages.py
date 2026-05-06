import fitz
import sys

pdf_path = '/media/islamux/Variety/JavaScriptProjects/bassaer/add_images_plan/ar-basaar.pdf'
doc = fitz.open(pdf_path)

for page_num in range(len(doc)):
    page = doc.load_page(page_num)
    text = page.get_text("text")
    if "الباب التاسع" in text:
        print(f"Found 'الباب التاسع' on page {page_num + 1}")
    if "132" in text and "السؤال" in text:
        print(f"Found 'السؤال 132' on page {page_num + 1}")
    if page_num > 100 and "132" in text:
         # Just in case 'السؤال' is not caught
         print(f"Found '132' on page {page_num + 1}")

doc.close()
