import fitz

doc = fitz.open('../add_images_plan/ar-basaar.pdf')
for page_num in range(350, 401):
    page = doc.load_page(page_num)
    text = page.get_text("text")
    if "الباب السابع" in text or "تفكيك" in text:
        print(f"--- Page {page_num + 1} ---")
        print(text[:200]) # First 200 chars
