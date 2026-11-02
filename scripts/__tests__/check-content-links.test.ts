import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { findBrokenLinks } from "../check-content-links.mjs";

let chaptersDir: string;
let publicDir: string;

beforeEach(() => {
  const root = mkdtempSync(path.join(tmpdir(), "content-links-"));
  chaptersDir = path.join(root, "chapters");
  publicDir = path.join(root, "public");
  mkdirSync(chaptersDir, { recursive: true });
  mkdirSync(path.join(publicDir, "images"), { recursive: true });
});

afterEach(() => {
  rmSync(path.dirname(chaptersDir), { recursive: true, force: true });
});

describe("findBrokenLinks", () => {
  it("reports missing images and keeps existing ones", () => {
    writeFileSync(path.join(publicDir, "images", "exists.png"), "");
    writeFileSync(
      path.join(chaptersDir, "chapter-1.md"),
      [
        "# الفصل الأول",
        "![موجود](/images/exists.png)",
        "![مفقود](/images/missing.png)",
        '<img src="/images/also-missing.png" alt="x" />',
      ].join("\n"),
    );

    expect(findBrokenLinks({ chaptersDir, publicDir })).toEqual([
      { file: "chapter-1.md", ref: "/images/also-missing.png" },
      { file: "chapter-1.md", ref: "/images/missing.png" },
    ]);
  });

  it("ignores remote, data and anchor references", () => {
    writeFileSync(
      path.join(chaptersDir, "chapter-2.md"),
      [
        "![remote](https://example.com/a.png)",
        "![data](data:image/png;base64,AAAA)",
        "[anchor](#section)",
      ].join("\n"),
    );

    expect(findBrokenLinks({ chaptersDir, publicDir })).toEqual([]);
  });

  it("decodes percent-encoded paths before checking", () => {
    writeFileSync(path.join(publicDir, "images", "صورة.png"), "");
    writeFileSync(
      path.join(chaptersDir, "chapter-3.md"),
      "![صورة](/images/%D8%B5%D9%88%D8%B1%D8%A9.png)",
    );

    expect(findBrokenLinks({ chaptersDir, publicDir })).toEqual([]);
  });

  it("sorts results by file then reference", () => {
    writeFileSync(
      path.join(chaptersDir, "b.md"),
      "![x](/images/z.png)\n![y](/images/a.png)",
    );
    writeFileSync(path.join(chaptersDir, "a.md"), "![x](/images/m.png)");

    expect(findBrokenLinks({ chaptersDir, publicDir })).toEqual([
      { file: "a.md", ref: "/images/m.png" },
      { file: "b.md", ref: "/images/a.png" },
      { file: "b.md", ref: "/images/z.png" },
    ]);
  });
});
