-- Migration: 001_create_bookmarks
-- Description: Create bookmarks table with RLS for per-user bookmark storage
-- Run this in your Supabase SQL Editor after creating your project

-- 1. Create the bookmarks table
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  chapter_id text not null,
  chapter_title text not null,
  created_at timestamptz default now(),
  unique(user_id, chapter_id)
);

-- 2. Grant Data API access (required by Supabase May 2026 policy change)
-- Without these, PostgREST returns 42501 for new projects after May 30, 2026
-- Existing projects: enforced from October 30, 2026
grant select, insert, delete on public.bookmarks to authenticated;
grant select, insert, update, delete on public.bookmarks to service_role;

-- 3. Enable Row Level Security
alter table public.bookmarks enable row level security;

-- 4. RLS policies
-- Users can view only their own bookmarks
create policy "Users can view own bookmarks"
  on public.bookmarks
  for select
  using (auth.uid() = user_id);

-- Users can insert their own bookmarks
create policy "Users can insert own bookmarks"
  on public.bookmarks
  for insert
  with check (auth.uid() = user_id);

-- Users can delete their own bookmarks
create policy "Users can delete own bookmarks"
  on public.bookmarks
  for delete
  using (auth.uid() = user_id);

-- 5. Index for fast lookups by user
create index if not exists idx_bookmarks_user_id on public.bookmarks(user_id);
create index if not exists idx_bookmarks_chapter_id on public.bookmarks(chapter_id);
