import fs from 'fs';
import path from 'path';

// Fix script to correct Arabic OCR artifacts
// Run from the web directory: node scripts/fix_arabic_syntax.js

const contentDir = path.join(process.cwd(), 'content');

const fixContent = (content) => {
  let newContent = content;

  // Simple string replacements anywhere in the text
  newContent = newContent.replace(/الأل/gu, 'الأ');
  newContent = newContent.replace(/الإل/gu, 'الإ');
  newContent = newContent.replace(/رضيدنا/gu, 'رصدنا');

  // Word replacements using lookarounds for Unicode boundaries
  const replaceWord = (word, replacement) => {
    const regex = new RegExp(`(?<=^|[^\\p{L}\\p{N}_])${word}(?=[^\\p{L}\\p{N}_]|$)`, 'gu');
    newContent = newContent.replace(regex, replacement);
  };

  replaceWord('أال', 'ألا');
  replaceWord('إال', 'إلا');
  replaceWord('خالل', 'خلال');
  replaceWord('الكالم', 'الكلام');
  replaceWord('إلثبات', 'إثبات');
  replaceWord('ال', 'لا');

  // Replace impossible Alef-Alef-Lam combinations that resulted from ligature inversions
  newContent = newContent.replace(/اال/gu, 'الا');
  newContent = newContent.replace(/الال/gu, 'اللا');

  return newContent;
};

const processDirectory = (dir) => {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.md')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const fixedContent = fixContent(content);
      
      if (content !== fixedContent) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log(`Fixed: ${filePath}`);
      }
    }
  });
};

console.log('Starting Arabic syntax fix...');
processDirectory(contentDir);
console.log('Done.');
