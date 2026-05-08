import fitz

doc = fitz.open('../add_images_plan/ar-basaar.pdf')
with open('ch7_start.txt', 'w', encoding='utf-8') as f:
    for page_num in range(352, 400): # Pages 353 to 400
        page = doc.load_page(page_num)
        text = page.get_text("text")
        f.write(f"--- Page {page_num + 1} ---\n")
        f.write(text)
        f.write("\n\n")
