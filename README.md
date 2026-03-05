# 📖 بصائر (Basaar) - Digital Book Platform

![Basaar Banner](https://img.shields.io/badge/%D8%A8%D8%B5%D8%A7%D8%A6%D8%B1-Digital_Book-8b5a2b?style=for-the-badge) ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)

**بصائر (Basaar)** is a modern, premium, and fully responsive digital reading platform built to showcase the Arabic book _"بصائر في الكون والحياة والدين"_ (Insights into the Universe, Life, and Religion) authored by **Dr. Haitham Talaat**.

Instead of a static PDF viewer, this project transforms the entire book into a fully-fledged knowledge base web application, optimizing the reading experience for Arabic typography (RTL) and modern aesthetics.

---

## ✨ Features

- **📚 Full Digital Conversion:** The original 900+ page PDF has been programmatically parsed, structured, and converted into Markdown chapters.
- **🌙 Elegant Dark / Light Mode:** A reading-friendly toggle with smooth color transitions, utilizing a "Parchment & Ink" (`--primary: #8b5a2b`) aesthetic.
- **✒️ Native Arabic Typography:** Beautifully formatted right-to-left (RTL) layout powered by the **Tajawal** Google font.
- **⚡ Blazing Fast Performance:** Statically generated (SSG) utilizing the **Next.js 15 App Router** for zero-latency page loads.
- **🧭 Intuitive Navigation:** Includes a sticky sidebar table of contents, smooth sequential (Next/Previous) links at the end of each chapter, and custom stylized scrollbars.
- **📱 Responsive Design:** Fully accessible whether reading from a 4K monitor or a mobile device.

---

## 🏗️ Architecture & Tech Stack

This project was engineered in two phases:

1. **Extraction (Python):**
   - Uses `PyMuPDF (fitz)` and Regular Expressions.
   - Extracts page-by-page text from the Arabic PDF.
   - Automatically segments text into 13 logical Markdown (`.md`) files based on heading hierarchies.
2. **Web Platform (TypeScript/React):**
   - **Framework:** Next.js 15 (React 19).
   - **Styling:** Tailwind CSS v4.
   - **Markdown Rendering:** `react-markdown` + `remark-gfm` to perfectly parse and display chapter content into rich HTML format (including `<blockquote>` for notes and `<h2>` for sub-questions).

> **Note:** The actual `ar-basaar.pdf` file has been stripped from the repository history to keep the Git bundle lightning fast (< 1MB) rather than carrying a 50MB binary blob.

---

## 🚀 How to Run Locally

Get the application running on your own machine in 3 simple steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/islamux/bassaer.git
   cd bassaer/web
   ```

2. **Install dependencies:**
   Make sure to use `pnpm` (highly recommended for this project configuration).

   ```bash
   pnpm install
   ```

3. **Start the development server:**

   ```bash
   pnpm dev
   ```

4. **Start reading!** Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```text
/
├── extract_content.py        # Python script used to extract the raw PDF text
├── DOCUMENTATION.md          # Technical overview of the AI's execution steps
└── /web                      # The Next.js application
    ├── /app                  # Layouts, Landing Page, and dynamic [slug] reader logic
    ├── /components           # Reusable UI elements (Navbar, Sidebar)
    ├── /content              # The actual Book Text (intro.md, chapter-1.md, etc.)
    └── /lib                  # fs-based Markdown loader scripts
```

---

## 📝 License & Content Rights

The source code for the Web Platform is open-source. However, the textual book content (found in `/web/content/*.md`) belongs wholly to its original author, **Dr. Haitham Talaat**.
