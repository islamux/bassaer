import { describe, it, expect, beforeEach, vi } from "vitest";

const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
  clear: vi.fn(() => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }),
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("bookmarks module", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("getBookmarks returns empty array when no bookmarks saved", async () => {
    const { getBookmarks } = await import("@/lib/bookmarks");
    const result = await getBookmarks();
    expect(result).toEqual([]);
  });

  it("toggleBookmark adds a bookmark", async () => {
    const { toggleBookmark, getBookmarks } = await import("@/lib/bookmarks");
    await toggleBookmark("chapter-1", "الفصل الأول");
    const bookmarks = await getBookmarks();
    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0].chapterId).toBe("chapter-1");
    expect(bookmarks[0].chapterTitle).toBe("الفصل الأول");
    expect(bookmarks[0].timestamp).toBeGreaterThan(0);
  });

  it("toggleBookmark removes existing bookmark", async () => {
    const { toggleBookmark, getBookmarks } = await import("@/lib/bookmarks");
    await toggleBookmark("chapter-1", "الفصل الأول");
    await toggleBookmark("chapter-1", "الفصل الأول");
    const bookmarks = await getBookmarks();
    expect(bookmarks).toHaveLength(0);
  });

  it("isBookmarked returns correct state", async () => {
    const { toggleBookmark, isBookmarked } = await import("@/lib/bookmarks");
    expect(await isBookmarked("chapter-1")).toBe(false);
    await toggleBookmark("chapter-1", "الفصل الأول");
    expect(await isBookmarked("chapter-1")).toBe(true);
  });

  it("removeBookmark removes specific bookmark", async () => {
    const { toggleBookmark, removeBookmark, getBookmarks } = await import("@/lib/bookmarks");
    await toggleBookmark("chapter-1", "الفصل الأول");
    await toggleBookmark("chapter-2", "الفصل الثاني");
    await removeBookmark("chapter-1");
    const bookmarks = await getBookmarks();
    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0].chapterId).toBe("chapter-2");
  });

  it("handles duplicate toggles gracefully", async () => {
    const { toggleBookmark, getBookmarks } = await import("@/lib/bookmarks");
    await toggleBookmark("chapter-1", "الفصل الأول");
    await toggleBookmark("chapter-1", "الفصل الأول");
    const bookmarks = await getBookmarks();
    expect(bookmarks).toHaveLength(0);
  });
});
