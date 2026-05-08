import { createClient } from "./supabase/client";

const STORAGE_KEY = "basaar-bookmarks";

export interface Bookmark {
  chapterId: string;
  chapterTitle: string;
  timestamp: number;
}

function isLoggedIn(): boolean {
  const supabase = createClient();
  return !!supabase.auth.getSession();
}

function getLocalBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalBookmarks(bookmarks: Bookmark[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data } = await supabase
      .from("bookmarks")
      .select("chapter_id, chapter_title, created_at")
      .order("created_at", { ascending: false });
    return (data || []).map((row: any) => ({
      chapterId: row.chapter_id,
      chapterTitle: row.chapter_title,
      timestamp: new Date(row.created_at).getTime(),
    }));
  }
  return getLocalBookmarks();
}

export async function toggleBookmark(chapterId: string, chapterTitle: string): Promise<Bookmark[]> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data: existing } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("chapter_id", chapterId)
      .single();
    if (existing) {
      await supabase.from("bookmarks").delete().eq("chapter_id", chapterId);
    } else {
      await supabase.from("bookmarks").insert({ chapter_id: chapterId, chapter_title: chapterTitle });
    }
    return getBookmarks();
  }
  const bookmarks = getLocalBookmarks();
  const idx = bookmarks.findIndex((b) => b.chapterId === chapterId);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.unshift({ chapterId, chapterTitle, timestamp: Date.now() });
  }
  setLocalBookmarks(bookmarks);
  return bookmarks;
}

export async function isBookmarked(chapterId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data } = await supabase.from("bookmarks").select("id").eq("chapter_id", chapterId).single();
    return !!data;
  }
  return getLocalBookmarks().some((b) => b.chapterId === chapterId);
}

export async function removeBookmark(chapterId: string): Promise<Bookmark[]> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await supabase.from("bookmarks").delete().eq("chapter_id", chapterId);
    return getBookmarks();
  }
  const bookmarks = getLocalBookmarks().filter((b) => b.chapterId !== chapterId);
  setLocalBookmarks(bookmarks);
  return bookmarks;
}

export async function mergeLocalToSupabase(): Promise<void> {
  const local = getLocalBookmarks();
  if (local.length === 0) return;
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from("bookmarks").upsert(
    local.map((b) => ({ chapter_id: b.chapterId, chapter_title: b.chapterTitle })),
    { onConflict: "user_id,chapter_id" }
  );
  localStorage.removeItem(STORAGE_KEY);
}
