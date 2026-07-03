import { describe, it, expect, beforeEach, vi } from "vitest";

const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
  clear: vi.fn(() => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }),
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("readingProgress module", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("getLocalProgress returns empty array initially", async () => {
    const { getLocalProgress } = await import("@/lib/readingProgress");
    expect(getLocalProgress()).toEqual([]);
  });

  it("saveChapterProgress stores and retrieves progress", async () => {
    const { saveChapterProgress, getChapterProgress } = await import("@/lib/readingProgress");
    saveChapterProgress("chapter-1", 50);
    const progress = getChapterProgress("chapter-1");
    expect(progress).toBeDefined();
    expect(progress!.chapterId).toBe("chapter-1");
    expect(progress!.scrollPercentage).toBe(50);
    expect(progress!.updatedAt).toBeGreaterThan(0);
  });

  it("updates existing chapter progress", async () => {
    const { saveChapterProgress, getChapterProgress } = await import("@/lib/readingProgress");
    saveChapterProgress("chapter-1", 50);
    saveChapterProgress("chapter-1", 75);
    const progress = getChapterProgress("chapter-1");
    expect(progress!.scrollPercentage).toBe(75);
  });

  it("returns undefined for unread chapter", async () => {
    const { getChapterProgress } = await import("@/lib/readingProgress");
    expect(getChapterProgress("nonexistent")).toBeUndefined();
  });

  it("saveChapterProgress stores multiple chapters independently", async () => {
    const { saveChapterProgress, getLocalProgress } = await import("@/lib/readingProgress");
    saveChapterProgress("chapter-1", 50);
    saveChapterProgress("chapter-2", 100);
    const all = getLocalProgress();
    expect(all).toHaveLength(2);
  });
});
