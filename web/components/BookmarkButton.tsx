"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";

interface BookmarkButtonProps {
  chapterId: string;
  chapterTitle: string;
}

export default function BookmarkButton({ chapterId, chapterTitle }: BookmarkButtonProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isBookmarked(chapterId));
  }, [chapterId]);

  const handleToggle = () => {
    const result = toggleBookmark(chapterId, chapterTitle);
    setActive(result.some(b => b.chapterId === chapterId));
    window.dispatchEvent(new Event("bookmarks-updated"));
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2.5 rounded-xl border transition-all duration-200 ${
        active
          ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]"
          : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30 hover:text-[var(--primary)]"
      }`}
      aria-label={active ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
    >
      <Bookmark
        className={`w-5 h-5 transition-all duration-200 ${active ? "fill-[var(--primary)]" : ""}`}
      />
    </button>
  );
}
