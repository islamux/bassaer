import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const chaptersDir = path.resolve(process.cwd(), "content", "chapters");
const outFile = path.resolve(process.cwd(), "public", "search-data.json");

function toSearchContent(raw) {
  return raw
    .split("\n")
    .filter((line) => !line.startsWith("#") && !line.startsWith(">"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  if (!existsSync(chaptersDir)) {
    process.stderr.write(`build-search-index: ${chaptersDir} not found\n`);
    process.exit(1);
  }

  const files = (await readdir(chaptersDir)).filter((f) => f.endsWith(".md")).sort();
  const docs = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(chaptersDir, file), "utf8");
      const id = file.replace(/\.md$/, "");
      const titleMatch = raw.match(/^#\s+(.*)/m);
      return {
        id,
        title: titleMatch ? titleMatch[1].trim() : id,
        content: toSearchContent(raw),
        slug: id,
      };
    })
  );

  const json = JSON.stringify(docs);
  await writeFile(outFile, json, "utf8");
  const sizeKb = Math.round(Buffer.byteLength(json, "utf8") / 1024);
  process.stdout.write(`build-search-index: wrote ${docs.length} chapters to public/search-data.json (${sizeKb} KB)\n`);
}

main().catch((err) => {
  process.stderr.write(`build-search-index failed: ${err}\n`);
  process.exit(1);
});
