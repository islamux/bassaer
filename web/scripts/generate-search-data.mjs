import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(__dirname, '..', 'content');
const outDir = path.resolve(__dirname, '..', 'public');

if (!fs.existsSync(contentDir)) {
  console.error('Content directory not found:', contentDir);
  process.exit(1);
}

const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

const chapters = files.map(file => {
  const content = fs.readFileSync(path.join(contentDir, file), 'utf8');
  const id = file.replace('.md', '');
  const titleMatch = content.match(/^#\s+(.*)/m);
  const title = titleMatch ? titleMatch[1].trim() : id;

  const cleanContent = content
    .replace(/^#\s+.*$/m, '')
    .replace(/^##\s+.*$/gm, '')
    .replace(/[﴿﴾]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { id, title, content: cleanContent, slug: id };
});

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outDir, 'search-data.json'),
  JSON.stringify(chapters),
  'utf8'
);

console.log(`Generated search data for ${chapters.length} chapters → public/search-data.json`);
