"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getChapterProgress, saveChapterProgress } from "@/lib/readingProgress";

interface ReadingProgressBarProps {
  chapterId: string;
}

function emptySubscribe() {
  return () => {};
}

export default function ReadingProgressBar({ chapterId }: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);

  const savedProgress = useSyncExternalStore(
    emptySubscribe,
    () => getChapterProgress(chapterId)?.scrollPercentage ?? 0,
    () => 0
  );
  const [prevSaved, setPrevSaved] = useState(0);
  if (prevSaved !== savedProgress) {
    setPrevSaved(savedProgress);
    setProgress(savedProgress);
  }

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    let parent = el.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (style.overflowY === "auto" || style.overflowY === "scroll") break;
      parent = parent.parentElement;
    }
    if (!parent) return;

    const saved = getChapterProgress(chapterId);
    if (saved && saved.scrollPercentage > 0) {
      const maxScroll = parent.scrollHeight - parent.clientHeight;
      parent.scrollTop = (saved.scrollPercentage / 100) * maxScroll;
    }

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const maxScroll = parent!.scrollHeight - parent!.clientHeight;
          const pct = maxScroll > 0 ? (parent!.scrollTop / maxScroll) * 100 : 0;
          const rounded = Math.min(100, Math.max(0, Math.round(pct)));
          setProgress(rounded);
          saveChapterProgress(chapterId, rounded);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    parent.addEventListener("scroll", handleScroll, { passive: true });
    return () => parent.removeEventListener("scroll", handleScroll);
  }, [chapterId]);

  return (
    <div
      ref={barRef}
      className="sticky top-0 z-10 h-[3px] w-full bg-[var(--border)]"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="تقدم القراءة"
    >
      <div
        className="h-full bg-[var(--primary)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
