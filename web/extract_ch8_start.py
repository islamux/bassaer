import fitz

doc = fitz.open('../add_images_plan/ar-basaar.pdf')
with open('ch8_start.txt', 'w', encoding='utf-8') as f:
    for i in range(398, 422):
        f.write(f'--- Page {i+1} ---\n\n')
        f.write(doc.load_page(i).get_text('text'))
        f.write('\n\n')

print("Extraction of Chapter 8 completed!")
