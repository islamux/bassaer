import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs", () => {
  const dir = `${process.cwd()}/content/chapters`;
  const files: Record<string, string> = {
    [`${dir}/intro.md`]: "# المقدمة\n\nهذه هي مقدمة الكتاب.",
    [`${dir}/chapter-1.md`]: "# الفصل الأول\n\nهذا هو الفصل الأول.",
    [`${dir}/chapter-2.md`]: "# الفصل الثاني\n\nهذا هو الفصل الثاني.",
  };
  const existsSync = vi.fn((p: string) => p in files || p === dir);
  const readdirSync = vi.fn(() => Object.keys(files).filter(f => f.endsWith('.md')).map(f => f.split('/').pop()!));
  const readFileSync = vi.fn((p: string) => files[p]);
  return {
    default: { existsSync, readdirSync, readFileSync },
    existsSync,
    readdirSync,
    readFileSync,
  };
});

describe("contentLoader", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("getAllChapters returns sorted chapters with intro first", async () => {
    const { getAllChapters } = await import("@/lib/contentLoader");
    const chapters = getAllChapters();
    expect(chapters).toHaveLength(3);
    expect(chapters[0].id).toBe("intro");
    expect(chapters[1].id).toBe("chapter-1");
    expect(chapters[2].id).toBe("chapter-2");
  });

  it("getAllChapters extracts titles from markdown headings", async () => {
    const { getAllChapters } = await import("@/lib/contentLoader");
    const chapters = getAllChapters();
    expect(chapters.find(c => c.id === "intro")!.title).toBe("المقدمة");
    expect(chapters.find(c => c.id === "chapter-1")!.title).toBe("الفصل الأول");
  });

  it("getAllChapters returns excerpts from first paragraph", async () => {
    const { getAllChapters } = await import("@/lib/contentLoader");
    const chapters = getAllChapters();
    expect(chapters[0].excerpt).toBeTruthy();
  });

  it("getChapterData returns chapter by id", async () => {
    const { getChapterData } = await import("@/lib/contentLoader");
    const chapter = getChapterData("chapter-1");
    expect(chapter).not.toBeNull();
    expect(chapter!.id).toBe("chapter-1");
    expect(chapter!.title).toBe("الفصل الأول");
  });

  it("getChapterData returns null for nonexistent id", async () => {
    const { getChapterData } = await import("@/lib/contentLoader");
    expect(getChapterData("nonexistent")).toBeNull();
  });
});
