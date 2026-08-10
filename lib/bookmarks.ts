import { createClient } from "./supabase/client";

const STORAGE_KEY = "basaar-bookmarks";
const CACHE_KEY = "basaar-bookmarks-cache";
const PENDING_SYNC_KEY = "basaar-bookmarks-pending";

export interface Bookmark {
  chapterId: string;
  chapterTitle: string;
  timestamp: number;
}

type SupabaseClient = ReturnType<typeof createClient>;

function readStorage(key: string): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(key: string, bookmarks: Bookmark[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(bookmarks));
}

function filterOut(list: Bookmark[], chapterId: string): Bookmark[] {
  return list.filter((b) => b.chapterId !== chapterId);
}

async function resolveAuth(): Promise<{ client: SupabaseClient; session: Awaited<ReturnType<SupabaseClient["auth"]["getSession"]>>["data"]["session"] }> {
  const client = createClient();
  try {
    const { data } = await client.auth.getSession();
    return { client, session: data.session };
  } catch (error) {
    console.warn("bookmarks: getSession failed, treating user as logged out", error);
    return { client, session: null };
  }
}

async function runDb<T>(op: () => PromiseLike<T>): Promise<{ ok: true; data: T } | { ok: false }> {
  try {
    return { ok: true, data: await op() };
  } catch (error) {
    console.warn("bookmarks: database request failed, using local fallback", error);
    return { ok: false };
  }
}

function removeFromLocalStores(chapterId: string) {
  writeStorage(CACHE_KEY, filterOut(readStorage(CACHE_KEY), chapterId));
  writeStorage(STORAGE_KEY, filterOut(readStorage(STORAGE_KEY), chapterId));
}

function addToLocalStores(entry: Bookmark) {
  writeStorage(CACHE_KEY, [entry, ...readStorage(CACHE_KEY)]);
  writeStorage(STORAGE_KEY, [entry, ...readStorage(STORAGE_KEY)]);
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const { client, session } = await resolveAuth();
  if (!session) return readStorage(STORAGE_KEY);

  const result = await runDb(() =>
    client
      .from("bookmarks")
      .select("chapter_id, chapter_title, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) =>
        (data || []).map((row: { chapter_id: string; chapter_title: string; created_at: string }) => ({
          chapterId: row.chapter_id,
          chapterTitle: row.chapter_title,
          timestamp: new Date(row.created_at).getTime(),
        }))
      )
  );
  if (result.ok) {
    writeStorage(CACHE_KEY, result.data);
    return result.data;
  }
  const cached = readStorage(CACHE_KEY);
  return cached.length > 0 ? cached : readStorage(STORAGE_KEY);
}

export async function toggleBookmark(chapterId: string, chapterTitle: string): Promise<Bookmark[]> {
  const { client, session } = await resolveAuth();
  const exists =
    readStorage(CACHE_KEY).some((b) => b.chapterId === chapterId) ||
    readStorage(STORAGE_KEY).some((b) => b.chapterId === chapterId);

  if (exists) {
    removeFromLocalStores(chapterId);
    if (session) await runDb(() => client.from("bookmarks").delete().eq("chapter_id", chapterId));
  } else {
    const entry: Bookmark = { chapterId, chapterTitle, timestamp: Date.now() };
    addToLocalStores(entry);
    if (session) {
      const inserted = await runDb(() =>
        client.from("bookmarks").insert({
          user_id: session.user.id,
          chapter_id: chapterId,
          chapter_title: chapterTitle,
        })
      );
      if (!inserted.ok) writeStorage(PENDING_SYNC_KEY, [...readStorage(PENDING_SYNC_KEY), entry]);
    }
  }
  return getBookmarks();
}

export async function removeBookmark(chapterId: string): Promise<Bookmark[]> {
  const { client, session } = await resolveAuth();
  if (session) await runDb(() => client.from("bookmarks").delete().eq("chapter_id", chapterId));
  removeFromLocalStores(chapterId);
  return getBookmarks();
}

export async function isBookmarked(chapterId: string): Promise<boolean> {
  const { client, session } = await resolveAuth();
  if (session) {
    const result = await runDb(() =>
      client.from("bookmarks").select("id").eq("chapter_id", chapterId).maybeSingle()
    );
    if (result.ok) return result.data !== null;
    const cached = readStorage(CACHE_KEY);
    if (cached.length > 0) return cached.some((b) => b.chapterId === chapterId);
  }
  return readStorage(STORAGE_KEY).some((b) => b.chapterId === chapterId);
}

export async function syncPendingBookmarks(): Promise<void> {
  const { client, session } = await resolveAuth();
  if (!session) return;

  const pending = readStorage(PENDING_SYNC_KEY);
  if (pending.length === 0) return;

  for (const b of pending) {
    await runDb(() =>
      client.from("bookmarks").upsert(
        { user_id: session.user.id, chapter_id: b.chapterId, chapter_title: b.chapterTitle },
        { onConflict: "user_id,chapter_id" }
      )
    );
  }
  writeStorage(PENDING_SYNC_KEY, []);
  writeStorage(CACHE_KEY, await getBookmarks());
}

export function stageLocalBookmarksForSync(): void {
  const local = readStorage(STORAGE_KEY);
  if (local.length === 0) return;
  const cached = readStorage(CACHE_KEY);
  const merged = [...local, ...cached.filter((c) => !local.some((l) => l.chapterId === c.chapterId))];
  writeStorage(CACHE_KEY, merged);
  writeStorage(PENDING_SYNC_KEY, [...readStorage(PENDING_SYNC_KEY), ...local]);
  writeStorage(STORAGE_KEY, []);
}
