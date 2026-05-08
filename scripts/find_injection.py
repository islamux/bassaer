import fitz

pdf_path = '/media/islamux/Variety/JavaScriptProjects/bassaer/add_images_plan/ar-basaar.pdf'
doc = fitz.open(pdf_path)

for page_num in range(len(doc)):
    page = doc.load_page(page_num)
    text = page.get_text("text")
    if "حقنة" in text:
        print(f"Found 'حقنة' on page {page_num + 1}")

doc.close()
