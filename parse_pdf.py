import fitz
import json

doc = fitz.open('ar-basaar.pdf')
toc = doc.get_toc()

print("Table of Contents:")
for item in toc:
    print(f"Level: {item[0]}, Title: {item[1]}, Page: {item[2]}")

print(f"\nTotal pages: {len(doc)}")
