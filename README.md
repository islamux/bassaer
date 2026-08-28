# 📖 بصائر (Basaar) - Digital Book Platform

![Basaar Banner](https://img.shields.io/badge/%D8%A8%D8%B5%D8%A7%D8%A6%D8%B1-Digital_Book-8b5a2b?style=for-the-badge) ![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)

**بصائر (Basaar)** is a modern, premium, and fully responsive digital reading platform built to showcase the Arabic book _"بصائر في الكون والحياة والدين"_ (Insights into the Universe, Life, and Religion) authored by **Dr. Haitham Talaat**.

Instead of a static PDF viewer, this project transforms the entire book into a fully-fledged knowledge base web application, optimizing the reading experience for Arabic typography (RTL) and modern aesthetics.

---

## ✨ Features

- **📚 Full Digital Conversion:** The original 900+ page PDF has been programmatically parsed, structured, and converted into Markdown chapters.
- **🔍 Full-Text Search:** Client-side full-text search across all chapters using FlexSearch, with RTL support and keyboard shortcuts (Ctrl+K).
- **🔖 Bookmarks:** Save chapters to a bookmarks list, visible in the sidebar and mobile menu. Persisted to `localStorage` on the device.
- **🌙 Elegant Dark / Light Mode:** A reading-friendly toggle with smooth color transitions, utilizing a "Parchment & Ink" (`--primary: #8b5a2b`) aesthetic.
- **✒️ Native Arabic Typography:** Beautifully formatted right-to-left (RTL) layout powered by the **Tajawal** Google font.
- **⚡ Blazing Fast Performance:** Fully static export (`next.config.ts` `output: "export"`) for zero-latency page loads, deployable to any static host (e.g. Hostinger shared hosting).
- **🧭 Intuitive Navigation:** Includes a sticky sidebar table of contents, smooth sequential (Next/Previous) links at the end of each chapter, and custom stylized scrollbars.
- **📱 Responsive Design:** Fully accessible whether reading from a 4K monitor or a mobile device.

---

## 🏗️ Architecture & Tech Stack

This project was engineered in two phases:

1. **Extraction (Python):**
   - Uses `python-docx` and Regular Expressions.
   - Extracts text from the Arabic DOCX source chapters.
   - Automatically segments text into 13 logical Markdown (`.md`) files based on heading hierarchies.
2. **Web Platform (TypeScript/React):**
   - **Framework:** Next.js 16 (React 19), fully static export (`output: "export"`).
   - **Styling:** Tailwind CSS v4.
   - **Markdown Rendering:** `react-markdown` + `remark-gfm` to perfectly parse and display chapter content into rich HTML format (including `<blockquote>` for notes and `<h2>` for sub-questions).
   - **Search:** FlexSearch 0.8. The search corpus (`public/search-data.json`) is generated at build time from the chapter markdown (`scripts/build-search-index.mjs`, wired to `prebuild`); the FlexSearch index itself is built client-side when the search dialog opens.
   - **Bookmarks:** `localStorage`-persisted (client-side only, synced across tabs via a `bookmarks-updated` CustomEvent).

> **Note:** The actual `ar-basaar.docx` file has been stripped from the repository history to keep the Git bundle lightning fast (< 1MB) rather than carrying the book's binary source.

---

## 🚀 How to Run Locally

Get the application running on your own machine in 3 simple steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/islamux/bassaer.git
   cd bassaer
   ```

2. **Install dependencies:**

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
├── app/                          # Next.js App Router (layout, pages, chapter/[slug], not-found, sitemap)
├── components/                   # UI (Navbar, Sidebar, SearchDialog, BookmarkButton, BookmarkedChapters, etc.)
├── lib/                          # Utilities, content loader, bookmarks, reading progress, search
├── content/                      # Arabic book chapters (.md files)
├── public/                       # Static assets, chapter images, manifest, sw.js (build-generated)
├── scripts/                      # Node (build-search-index.mjs) + Python extraction utilities
├── docs/                         # Documentation (upgrade notes, interview Q&A)
├── package.json
├── next.config.ts
├── tsconfig.json
└── AGENTS.md                     # AI agent guide
```

---

---

## 🚀 Deploy (Static Export)

The app builds to a fully static export with `pnpm build` (writes to `out/`), deployable to any static file host:

```bash
pnpm install
pnpm build   # runs prebuild (search index) then next build; produces out/
```

Upload the contents of `out/` to your static host (e.g. Hostinger shared hosting). Because the output is plain static files, no server runtime is required. The service worker (`public/sw.js`) is generated during the build and deployed with the rest of the static output.

---

## 📝 License & Content Rights

The source code for the Web Platform is open-source. However, the textual book content (found in `content/*.md`) belongs wholly to its original author, **Dr. Haitham Talaat**.
