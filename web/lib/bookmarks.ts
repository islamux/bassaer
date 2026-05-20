import { createClient } from "./supabase/client";

const STORAGE_KEY = "basaar-bookmarks";
const CACHE_KEY = "basaar-bookmarks-cache";
const PENDING_SYNC_KEY = "basaar-bookmarks-pending";

export interface Bookmark {
  chapterId: string;
  chapterTitle: string;
  timestamp: number;
}

function getLocalStorage(key: string): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalStorage(key: string, bookmarks: Bookmark[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(bookmarks));
}

async function trySupabase<T>(fn: () => T | PromiseLike<T>): Promise<{ ok: true; data: T } | { ok: false }> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const supabase = createClient();
  const session = await trySupabase(() => supabase.auth.getSession().then((r) => r.data.session));
  if (session.ok && session.data) {
    const result = await trySupabase(() =>
      supabase
        .from("bookmarks")
        .select("chapter_id, chapter_title, created_at")
        .order("created_at", { ascending: false })
        .then(({ data }) =>
          (data || []).map((row: any) => ({
            chapterId: row.chapter_id,
            chapterTitle: row.chapter_title,
            timestamp: new Date(row.created_at).getTime(),
          }))
        )
    );
    if (result.ok) {
      setLocalStorage(CACHE_KEY, result.data);
      return result.data;
    }
    const cached = getLocalStorage(CACHE_KEY);
    if (cached.length > 0) return cached;
  }
  return getLocalStorage(STORAGE_KEY);
}

async function writeThroughToggle(chapterId: string, chapterTitle: string, action: "toggle" | "add" | "remove"): Promise<Bookmark[]> {
  const supabase = createClient();
  const all = getLocalStorage(CACHE_KEY);
  const anonymous = getLocalStorage(STORAGE_KEY);
  const session = await trySupabase(() => supabase.auth.getSession().then((r) => r.data.session));
  const isLoggedIn = session.ok && !!session.data;

  if (action === "remove") {
    if (isLoggedIn) {
      setLocalStorage(CACHE_KEY, all.filter((b) => b.chapterId !== chapterId));
      await trySupabase(() => supabase.from("bookmarks").delete().eq("chapter_id", chapterId));
    }
    setLocalStorage(STORAGE_KEY, anonymous.filter((b) => b.chapterId !== chapterId));
    return getBookmarks();
  }

  const exists = all.find((b) => b.chapterId === chapterId) || anonymous.find((b) => b.chapterId === chapterId);
  if (exists) {
    if (isLoggedIn) {
      setLocalStorage(CACHE_KEY, all.filter((b) => b.chapterId !== chapterId));
      await trySupabase(() => supabase.from("bookmarks").delete().eq("chapter_id", chapterId));
    }
    setLocalStorage(STORAGE_KEY, anonymous.filter((b) => b.chapterId !== chapterId));
  } else {
    const entry: Bookmark = { chapterId, chapterTitle, timestamp: Date.now() };
    if (isLoggedIn) {
      setLocalStorage(CACHE_KEY, [entry, ...all]);
      const result = await trySupabase(() => supabase.from("bookmarks").insert({ chapter_id: chapterId, chapter_title: chapterTitle }));
      if (!result.ok) {
        setLocalStorage(PENDING_SYNC_KEY, [...getLocalStorage(PENDING_SYNC_KEY), entry]);
      }
    }
    setLocalStorage(STORAGE_KEY, [entry, ...anonymous]);
  }
  return getBookmarks();
}

export async function toggleBookmark(chapterId: string, chapterTitle: string): Promise<Bookmark[]> {
  return writeThroughToggle(chapterId, chapterTitle, "toggle");
}

export async function removeBookmark(chapterId: string): Promise<Bookmark[]> {
  return writeThroughToggle(chapterId, "", "remove");
}

export async function isBookmarked(chapterId: string): Promise<boolean> {
  const supabase = createClient();
  const session = await trySupabase(() => supabase.auth.getSession().then((r) => r.data.session));
  if (session.ok && session.data) {
    const result = await trySupabase(() => supabase.from("bookmarks").select("id").eq("chapter_id", chapterId).single());
    if (result.ok) return !!result.data;
    const cached = getLocalStorage(CACHE_KEY);
    if (cached.length > 0) return cached.some((b) => b.chapterId === chapterId);
  }
  return getLocalStorage(STORAGE_KEY).some((b) => b.chapterId === chapterId);
}

export async function syncPendingBookmarks(): Promise<void> {
  const supabase = createClient();
  const session = await trySupabase(() => supabase.auth.getSession().then((r) => r.data.session));
  if (!(session.ok && session.data)) return;

  const pending = getLocalStorage(PENDING_SYNC_KEY);
  if (pending.length === 0) return;

  for (const b of pending) {
    await trySupabase(() =>
      supabase.from("bookmarks").upsert(
        { chapter_id: b.chapterId, chapter_title: b.chapterTitle },
        { onConflict: "user_id,chapter_id" }
      )
    );
  }
  setLocalStorage(PENDING_SYNC_KEY, []);
  const fresh = await getBookmarks();
  setLocalStorage(CACHE_KEY, fresh);
}

export function mergeLocalToSupabase(): void {
  const local = getLocalStorage(STORAGE_KEY);
  if (local.length === 0) return;
  const cached = getLocalStorage(CACHE_KEY);
  const merged = [...local, ...cached.filter((c) => !local.some((l) => l.chapterId === c.chapterId))];
  setLocalStorage(CACHE_KEY, merged);
  setLocalStorage(PENDING_SYNC_KEY, [...getLocalStorage(PENDING_SYNC_KEY), ...local]);
  setLocalStorage(STORAGE_KEY, []);
}
