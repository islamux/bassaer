import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_CHAPTERS_DIR = path.resolve(process.cwd(), "content", "chapters");
const DEFAULT_OUT_FILE = path.resolve(process.cwd(), "public", "search-data.json");

/**
 * @param {string} raw
 * @returns {string}
 */
export function toSearchContent(raw) {
  return raw
    .split("\n")
    .filter((line) => !line.startsWith("#") && !line.startsWith(">"))
    .join(" ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/<img[^>]*>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {{ chaptersDir?: string, outFile?: string }} [options]
 * @returns {Promise<{ count: number, sizeKb: number, outFile: string }>}
 */
export async function buildSearchIndex(options = {}) {
  const chaptersDir = options.chaptersDir ?? DEFAULT_CHAPTERS_DIR;
  const outFile = options.outFile ?? DEFAULT_OUT_FILE;

  if (!existsSync(chaptersDir)) {
    throw new Error(`${chaptersDir} not found`);
  }

  const files = (await readdir(chaptersDir)).filter((f) => f.endsWith(".md")).sort();
  const docs = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(chaptersDir, file), "utf8");
      const id = file.replace(/\.md$/, "");
      const titleMatch = raw.match(/^#\s+(.*)/m);
      const title = titleMatch ? titleMatch[1].trim() : id;
      const content = toSearchContent(raw);
      return {
        id,
        title,
        content,
        slug: id,
      };
    })
  );

  const json = JSON.stringify(docs);
  await writeFile(outFile, json, "utf8");
  const sizeKb = Math.round(Buffer.byteLength(json, "utf8") / 1024);
  return { count: docs.length, sizeKb, outFile };
}

async function main() {
  const { count, sizeKb, outFile } = await buildSearchIndex();
  const relative = path.relative(process.cwd(), outFile);
  process.stdout.write(
    `build-search-index: wrote ${count} chapters to ${relative} (${sizeKb} KB)\n`
  );
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entry) {
  main().catch((err) => {
    process.stderr.write(`build-search-index failed: ${err}\n`);
    process.exit(1);
  });
}
