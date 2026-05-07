const STORAGE_KEY = "basaar-bookmarks";

export interface Bookmark {
  chapterId: string;
  chapterTitle: string;
  timestamp: number;
}

export function getBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(chapterId: string, chapterTitle: string): Bookmark[] {
  const bookmarks = getBookmarks();
  const existing = bookmarks.findIndex(b => b.chapterId === chapterId);
  if (existing >= 0) {
    bookmarks.splice(existing, 1);
  } else {
    bookmarks.unshift({ chapterId, chapterTitle, timestamp: Date.now() });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  return bookmarks;
}

export function isBookmarked(chapterId: string): boolean {
  return getBookmarks().some(b => b.chapterId === chapterId);
}

export function removeBookmark(chapterId: string): Bookmark[] {
  const bookmarks = getBookmarks().filter(b => b.chapterId !== chapterId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  return bookmarks;
}
