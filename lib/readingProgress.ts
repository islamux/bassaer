const STORAGE_KEY = "basaar-reading-progress";

export interface ReadingProgress {
  chapterId: string;
  scrollPercentage: number;
  updatedAt: number;
}

export function getLocalProgress(): ReadingProgress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalProgress(progress: ReadingProgress[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getChapterProgress(chapterId: string): ReadingProgress | undefined {
  return getLocalProgress().find((p) => p.chapterId === chapterId);
}

export function saveChapterProgress(chapterId: string, scrollPercentage: number) {
  const all = getLocalProgress();
  const idx = all.findIndex((p) => p.chapterId === chapterId);
  const entry: ReadingProgress = { chapterId, scrollPercentage, updatedAt: Date.now() };
  if (idx >= 0) {
    all[idx] = entry;
  } else {
    all.push(entry);
  }
  setLocalProgress(all);
}
