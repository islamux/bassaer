import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const MARKDOWN_IMAGE = /!\[[^\]]*\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;
const HTML_IMAGE = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

function collectRefs(markdown) {
  const refs = [];
  for (const regex of [MARKDOWN_IMAGE, HTML_IMAGE]) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      const ref = match[1].trim();
      if (ref && !EXTERNAL.test(ref)) refs.push(ref);
    }
  }
  return refs;
}

function resolveRef(ref, publicDir, chaptersDir) {
  const clean = ref.split("#")[0].split("?")[0];
  let decoded;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    decoded = clean;
  }
  const base = decoded.startsWith("/") ? publicDir : chaptersDir;
  return path.join(base, decoded.replace(/^\/+/, ""));
}

/**
 * Scans chapter markdown for image references that do not resolve on disk.
 *
 * @param {{ chaptersDir?: string, publicDir?: string }} [options]
 * @returns {Array<{ file: string, ref: string }>}
 */
export function findBrokenLinks(options = {}) {
  const chaptersDir = options.chaptersDir ?? path.resolve(process.cwd(), "content", "chapters");
  const publicDir = options.publicDir ?? path.resolve(process.cwd(), "public");

  if (!existsSync(chaptersDir)) return [];

  const files = readdirSync(chaptersDir)
    .filter((file) => file.endsWith(".md"))
    .sort();

  const broken = [];
  for (const file of files) {
    const markdown = readFileSync(path.join(chaptersDir, file), "utf8");
    for (const ref of collectRefs(markdown)) {
      if (!existsSync(resolveRef(ref, publicDir, chaptersDir))) {
        broken.push({ file, ref });
      }
    }
  }

  return broken.sort((a, b) =>
    a.file === b.file ? a.ref.localeCompare(b.ref) : a.file.localeCompare(b.file),
  );
}

/**
 * Counts every image reference (valid or broken) in the chapter set.
 *
 * @param {{ chaptersDir?: string }} [options]
 * @returns {number}
 */
export function countReferences(options = {}) {
  const chaptersDir = options.chaptersDir ?? path.resolve(process.cwd(), "content", "chapters");
  if (!existsSync(chaptersDir)) return 0;

  return readdirSync(chaptersDir)
    .filter((file) => file.endsWith(".md"))
    .reduce(
      (total, file) =>
        total + collectRefs(readFileSync(path.join(chaptersDir, file), "utf8")).length,
      0,
    );
}

function main() {
  const broken = findBrokenLinks();
  const total = countReferences();

  if (broken.length > 0) {
    for (const { file, ref } of broken) {
      process.stderr.write(`broken: ${file} -> ${ref}\n`);
    }
  }

  process.stdout.write(`${broken.length} broken links across ${total} references\n`);
  if (broken.length > 0) process.exitCode = 1;
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entry) {
  main();
}
