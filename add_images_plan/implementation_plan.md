# Implementation Plan - Re-extracting Book Content and Integrating Images

Fix the current fragmented and mislabeled markdown files by re-extracting the book content correctly from `ar-basaar.pdf`. Then, integrate the curated images into the correct chapters to ensure they appear in the right context.

## Proposed Changes

### Content Extraction

#### [NEW] [re_extract_book.py](file:///media/islamux/Variety/JavaScriptProjects/bassaer-antigravity/re_extract_book.py)

Create a new script to:

- Open `ar-basaar.pdf`.
- Skip the Table of Contents (pages 1-24).
- Extract text and split by `الباب X` headings.
- Save each chapter to `web/content/chapter-X.md`.
- Save the introduction to `web/content/intro.md`.

### Image Integration

#### [MODIFY] [integrate_images.py](file:///media/islamux/Variety/JavaScriptProjects/bassaer-antigravity/integrate_images.py)

Update the integration script to work with the newly extracted files:

- Re-run the image mapping logic against the new chapter boundaries.
- Inject markdown image tags into the new `web/content/*.md` files.

### Cleanup

- Delete the old, messy `web/content/chapter-*.md` files before re-extracting if necessary (or just overwrite).

## Verification Plan

### Manual Verification

1. **Run Extraction**: Execute `python3 re_extract_book.py`.
2. **Verify Files**: Check `web/content/` to ensure `chapter-1.md` through `chapter-15.md` exist and have correct content.
3. **Run Dev Server**:
   ```bash
   pnpm dev
   ```
4. **Browser Check**: Open `http://localhost:3000` and navigate through all chapters. Verify that:
   - Chapters follow the logical order of the book.
   - Images are displayed and relevant to the content.
   - No chapters are accidentally truncated or merged.
