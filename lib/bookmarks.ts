const STORAGE_KEY = "basaar-bookmarks";

export interface Bookmark {
  chapterId: string;
  chapterTitle: string;
  timestamp: number;
}

function readStorage(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(bookmarks: Bookmark[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export async function getBookmarks(): Promise<Bookmark[]> {
  return readStorage();
}

export async function toggleBookmark(chapterId: string, chapterTitle: string): Promise<Bookmark[]> {
  const bookmarks = readStorage();
  const next = bookmarks.some((b) => b.chapterId === chapterId)
    ? bookmarks.filter((b) => b.chapterId !== chapterId)
    : [{ chapterId, chapterTitle, timestamp: Date.now() }, ...bookmarks];
  writeStorage(next);
  return next;
}

export async function removeBookmark(chapterId: string): Promise<Bookmark[]> {
  const next = readStorage().filter((b) => b.chapterId !== chapterId);
  writeStorage(next);
  return next;
}

export async function isBookmarked(chapterId: string): Promise<boolean> {
  return readStorage().some((b) => b.chapterId === chapterId);
}
