# Project Handoff: Bassaer Image & Content Integration

## Current Status

- **Goal**: Re-extract the book content from `ar-basaar.pdf` accurately and integrate curated images.
- **Problem**: The existing `web/content/*.md` files were extracted poorly (splitting on the Table of Contents instead of actual chapters).
- **Assets Ready**: 41 curated and cleaned images are available in `/media/islamux/Variety/JavaScriptProjects/bassaer-antigravity/web/public/images/`.

## Next Steps for the New Model

1. **Read Core Plans**:
   - [Implementation Plan](./implementation_plan.md) (The technical roadmap).
   - [Task List](./task.md) (The progress checklist).
2. **Execute Re-extraction**:
   - Create `re_extract_book.py` to open `ar-basaar.pdf`.
   - Skip the TOC (approx. first 24 pages).
   - Split content by `الباب X` headings (refer to `Implementation Plan` for details).
   - Save to `web/content/chapter-X.md`.
3. **Re-integrate Images**:
   - Update and run `integrate_images.py` to inject the curated images into the _new_ markdown files in the correct context.

## Key Files

- `ar-basaar.pdf`: The source PDF.
- `web/content/`: Where the new markdown chapters should go.
- `web/public/images/`: Curated image assets.
- `integrate_images.py`: Existing script that needs adjustment for the new chapter boundaries.
