import fs from 'fs';
import path from 'path';

const contentDirectory = path.resolve(process.cwd(), 'content', 'chapters');

export interface ChapterMeta {
  id: string;
  title: string;
  excerpt: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export function getAllChapters(): ChapterMeta[] {
  // Ensure the directory exists
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(contentDirectory);
  
  const chapters = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      // Basic extraction of title from first h1
      const titleMatch = fileContents.match(/^#\s+(.*)/m);
      const title = titleMatch ? titleMatch[1] : id;
      
      // Extract a short excerpt (first paragraph)
      const paragraphs = fileContents.split('\n\n').filter(p => p.trim() && !p.startsWith('#'));
      const excerpt = paragraphs.length > 0 ? paragraphs[0].substring(0, 100) + '...' : '';

      return {
        id,
        title,
        excerpt
      };
    });

  // Sort them loosely based on 'chapter-X' vs 'intro' (make intro first)
  return chapters.sort((a, b) => {
    if (a.id === 'intro') return -1;
    if (b.id === 'intro') return 1;
    
    // Extract numbers from "chapter-X"
    const aNum = parseInt(a.id.replace('chapter-', ''));
    const bNum = parseInt(b.id.replace('chapter-', ''));
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    return a.id.localeCompare(b.id);
  });
}

// Allowlist of valid chapter ids to prevent path traversal.
const VALID_CHAPTER_ID = /^(intro|chapter-[0-9]+)$/;

function isValidChapterId(id: string): boolean {
  return typeof id === 'string' && VALID_CHAPTER_ID.test(id);
}

function safeChapterPath(id: string): string | null {
  if (!isValidChapterId(id)) return null;
  const fullPath = path.resolve(contentDirectory, `${id}.md`);
  // Defense in depth: resolved path must remain inside content directory.
  if (!fullPath.startsWith(contentDirectory + path.sep)) return null;
  return fullPath;
}

export function getChapterData(id: string): Chapter | null {
  const fullPath = safeChapterPath(id);
  if (!fullPath) return null;
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  const titleMatch = fileContents.match(/^#\s+(.*)/m);
  const title = titleMatch ? titleMatch[1] : id;

  return {
    id,
    title,
    content: fileContents
  };
}

export function getChapterUpdatedAt(id: string): Date | null {
  const fullPath = safeChapterPath(id);
  if (!fullPath) return null;
  if (!fs.existsSync(fullPath)) return null;

  try {
    return fs.statSync(fullPath).mtime;
  } catch {
    return null;
  }
}
