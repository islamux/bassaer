# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **New project**
3. Fill in:
   - **Name:** `basaer` (or any name)
   - **Database Password:** Save this securely
   - **Region:** Choose closest to your users
4. Wait for the database to provision (~2 minutes)

## 2. Get API Credentials

From your project dashboard → **Project Settings** → **API**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` |

## 3. Configure `.env.local`

Add these to `web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

> **Important:** `NEXT_PUBLIC_` prefix exposes the anon key to the browser — this is safe because Supabase RLS policies control data access.

## 4. Install Packages

Already done — `@supabase/supabase-js` and `@supabase/ssr` are in `web/package.json`.

## 5. Database Schema

Run this in Supabase SQL Editor (Dashboard → SQL Editor):

```sql
-- Bookmarks table
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id text not null,
  chapter_title text not null,
  created_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

-- Index for fast lookups per user
create index bookmarks_user_id_idx on bookmarks (user_id);
```

## 6. Row Level Security (RLS)

After creating the table, enable RLS and add policies:

```sql
-- Enable RLS
alter table bookmarks enable row level security;

-- Users can read only their own bookmarks
create policy "Users can read own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

-- Users can insert only their own bookmarks
create policy "Users can insert own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

-- Users can delete only their own bookmarks
create policy "Users can delete own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);
```

## 7. Enable Auth Providers

In Dashboard → **Authentication** → **Providers**:

- **Email**: Enabled by default — supports magic link (no password required)
- **Google**: Toggle on, add OAuth credentials from Google Cloud Console
  - Get Client ID + Secret from Google Cloud Console → APIs & Services → Credentials
  - Set redirect URL: `https://[PROJECT_REF].supabase.co/auth/v1/callback`

## 8. Client Setup Files

### `web/lib/supabase/client.ts`

Browser client — used in client components (`"use client"`):

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### `web/lib/supabase/server.ts`

Server client — used in server components, API routes, and server actions:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

## 9. Usage

### Read bookmarks (server component)

```ts
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data: bookmarks } = await supabase
  .from("bookmarks")
  .select("*")
  .order("created_at", { ascending: false });
```

### Add bookmark (client component)

```ts
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
await supabase.from("bookmarks").insert({
  chapter_id: "chapter-1",
  chapter_title: "العنوان",
});
```

## 10. Authentication Flow

### Sign in with magic link

```ts
const supabase = createClient();
await supabase.auth.signInWithOtp({
  email: "user@example.com",
  options: { shouldCreateUser: true },
});
```

### Sign in with Google

```ts
const supabase = createClient();
await supabase.auth.signInWithOAuth({ provider: "google" });
```

### Get current user

```ts
const { data: { user } } = await supabase.auth.getUser();
```

### Sign out

```ts
await supabase.auth.signOut();
```

## Next Steps

After completing the setup above, update the bookmark library (`web/lib/bookmarks.ts`) to:
1. Try Supabase first when user is authenticated
2. Fall back to localStorage for anonymous users
3. Merge localStorage bookmarks into Supabase on login
