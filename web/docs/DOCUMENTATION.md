# Project Documentation: Basaar Arabic Digital Book (بصائر)

## 1. Project Overview

The objective of this project was to convert a provided Arabic PDF book ("بصائر" - Basaar) into a modern, complete, and responsive digital book website. The goal was to extract the text from the PDF, structure it into chapters, and build a premium reading experience using modern web technologies.

## 2. Technology Stack

- **Extraction:** Python, PyMuPDF (`fitz`), Regular Expressions (Regex).
- **Framework:** Next.js 15 (App Router, React Server Components).
- **Styling:** TailwindCSS v4 with custom styling for Arabic typography and themes.
- **Content Rendering:** React Markdown (`react-markdown`, `remark-gfm`).
- **Icons:** Lucide React.
- **Language:** TypeScript.

## 3. Execution Process

### Step 1: PDF Text Extraction & Structuring

1. **Tooling Setup:** A Python virtual environment was created, and `PyMuPDF` was installed to handle PDF parsing.
2. **Text Parsing Strategy:** We wrote a script (`extract_content.py`) that iterated through all 900+ pages of the Arabic PDF.
3. **Chapter Segmentation:** We used a Regex pattern matching Arabic chapter headings (`الباب األول`, `الباب الثاني`, etc.) to split the raw text into distinct sections.
4. **Markdown Generation:** The segmented content was formatted and output as Markdown (`.md`) files (e.g., `intro.md`, `chapter-1.md` through `chapter-13.md`) and saved to a dedicated `content` directory.

### Step 2: Next.js Website Architecture

A new Next.js project (`web`) was bootstrapped using the Next.js CLI. The following folder structure was implemented:

- `content/` - Contains the extracted `.md` chapter files.
- `lib/contentLoader.ts` - Node.js File System (fs) utility to scan the `content/` folder, parse file names, and load markdown text cleanly.
- `app/page.tsx` - The landing page acting as an elegant book cover and index, rendering the list of chapters dynamically.
- `app/chapter/[slug]/page.tsx` - A dynamic Next.js App Route utilizing `generateStaticParams` for Static Site Generation (SSG). This route reads the requested markdown file and renders it beautifully using `react-markdown`.
- `components/Sidebar.tsx` - A sticky desktop sidebar to navigate between chapters quickly.
- `components/Navbar.tsx` - A top navigation bar featuring a custom Dark/Light Mode toggle.

### Step 3: UI/UX & Arabic Typography Implementation

To ensure a premium and comfortable long-form reading experience:

- **Tailwind Customization:** Added custom CSS variables to `app/globals.css` with a "Golden/Brown" color palette mimicking old parchment/books (`--primary`), along with dark mode counterparts.
- **Typography:** Integrated the Arabic native Google Font (`Tajawal`) natively optimized by Next.js in `app/layout.tsx`.
- **RTL Layout:** Established `dir="rtl"` in the root HTML tag for correct native Arabic language flow.
- **Layout Detail:** Enhanced the reading area with custom elegant scrollbars, subtle hover animations, soft contrast for reading, and distinct style wrappers for "blockquote" tags (used for important notes).

### Step 4: Finalizing & Automation

- Re-wired Next.js configs (`package.json`, `tsconfig.json`) due to some initial registry network timeouts, explicitly adding all required libraries (`lucide-react`, `react-markdown`).
- Tested the local static generation logic to ensure the pages load seamlessly without backend delays.

## 4. How to Run Locally

1. Open your terminal in the Next.js app directory:
   ```bash
   cd web
   ```
2. Install the necessary Node.js dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
4. Preview the premium reading experience at `http://localhost:3000`.
