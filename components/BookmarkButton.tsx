"use client";

import { useState, useEffect, useCallback } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";

interface BookmarkButtonProps {
  chapterId: string;
  chapterTitle: string;
}

export default function BookmarkButton({ chapterId, chapterTitle }: BookmarkButtonProps) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [prevChapter, setPrevChapter] = useState(chapterId);

  if (prevChapter !== chapterId) {
    setPrevChapter(chapterId);
    setActive(false);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    isBookmarked(chapterId).then((val) => {
      if (cancelled) return;
      setActive(val);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  const handleToggle = useCallback(async () => {
    setLoading(true);
    const result = await toggleBookmark(chapterId, chapterTitle);
    setActive(result.some(b => b.chapterId === chapterId));
    setLoading(false);
    window.dispatchEvent(new Event("bookmarks-updated"));
  }, [chapterId, chapterTitle]);

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2.5 rounded-xl border transition-all duration-200 ${
        loading
          ? "border-[var(--border)] text-[var(--muted-foreground)] opacity-50 cursor-not-allowed"
          : active
            ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]"
            : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30 hover:text-[var(--primary)]"
      }`}
      aria-label={active ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Bookmark
          className={`w-5 h-5 transition-all duration-200 ${active ? "fill-[var(--primary)]" : ""}`}
        />
      )}
    </button>
  );
}
