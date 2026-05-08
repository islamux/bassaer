"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bookmark as BookmarkIcon, BookmarkX } from "lucide-react";
import { getBookmarks, removeBookmark, type Bookmark } from "@/lib/bookmarks";

export default function BookmarkedChapters() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const load = useCallback(async () => {
    setBookmarks(await getBookmarks());
  }, []);

  useEffect(() => {
    load();
    const handle = () => load();
    window.addEventListener("storage", handle);
    window.addEventListener("bookmarks-updated", handle);
    return () => {
      window.removeEventListener("storage", handle);
      window.removeEventListener("bookmarks-updated", handle);
    };
  }, [load]);

  const handleRemove = useCallback(async (chapterId: string) => {
    await removeBookmark(chapterId);
    await load();
    window.dispatchEvent(new Event("bookmarks-updated"));
  }, [load]);

  if (bookmarks.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-sm font-bold text-[var(--primary)] mb-3 flex items-center gap-2">
        <BookmarkIcon className="w-4 h-4 fill-[var(--primary)]" />
        المفضلة
      </h4>
      <ul className="space-y-1">
        {bookmarks.map(b => (
          <li key={b.chapterId} className="group flex items-center justify-between">
            <Link
              href={`/chapter/${b.chapterId}`}
              className="flex-1 text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors py-1 truncate"
            >
              {b.chapterTitle}
            </Link>
            <button
              onClick={() => handleRemove(b.chapterId)}
              className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted-foreground)] hover:text-red-500 transition-all"
              aria-label={`إزالة ${b.chapterTitle} من المفضلة`}
            >
              <BookmarkX className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
