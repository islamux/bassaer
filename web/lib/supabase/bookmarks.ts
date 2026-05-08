import { createClient } from "./client";
import type { Bookmark } from "../bookmarks";

export async function getSupabaseBookmarks(): Promise<Bookmark[]> {
  const supabase = createClient();
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

export async function addSupabaseBookmark(chapterId: string, chapterTitle: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("bookmarks")
    .insert({ chapter_id: chapterId, chapter_title: chapterTitle });
  return error ? { error: error.message } : {};
}

export async function removeSupabaseBookmark(chapterId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("chapter_id", chapterId);
  return error ? { error: error.message } : {};
}

export async function isSupabaseBookmarked(chapterId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("chapter_id", chapterId)
    .single();
  return !!data;
}

export async function pushLocalBookmarksToSupabase(bookmarks: Bookmark[]) {
  const supabase = createClient();
  const { error } = await supabase
    .from("bookmarks")
    .upsert(
      bookmarks.map((b) => ({
        chapter_id: b.chapterId,
        chapter_title: b.chapterTitle,
      })),
      { onConflict: "user_id,chapter_id" }
    );
  return error ? { error: error.message } : {};
}
