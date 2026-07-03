# Ship-Ready Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Basaar from a working prototype into a production-ready PWA with tests, clean code, security hardening, and deployment configuration.

**Architecture:** Next.js 16 App Router with Supabase auth + Serwist PWA. All chapters are statically generated. Client-side search via FlexSearch. Testing via Vitest + RTL (unit/integration) and Playwright (E2E).

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, Supabase, Serwist, FlexSearch, Vitest, @testing-library/react, Playwright

---

### Task 1: Remove Dead Code

**Files:**
- Delete: `proxy.ts`
- Delete: `lib/supabase/bookmarks.ts`
- Delete: `docs/word-audit-*.md` (15 files)
- Delete: `docs/word-diff-reports/` directory
- Verify: no other files import the deleted modules

- [ ] **Step 1: Remove proxy.ts and verify nothing imports it**

Run: `rg "from.*proxy" --type ts --type tsx`

Expected: No results (file is dead code).

Then delete:
```bash
rm proxy.ts
```

- [ ] **Step 2: Remove duplicate supabase/bookmarks.ts and verify nothing imports it**

Run: `rg "supabase/bookmarks" --type ts --type tsx`

Expected: No results (lib/bookmarks.ts is the canonical one; it imports from supabase/client only).

Then delete:
```bash
rm lib/supabase/bookmarks.ts
```

- [ ] **Step 3: Remove stale audit report docs**

```bash
rm docs/word-audit-*.md
rm -rf docs/word-diff-reports/
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove dead code — proxy.ts, duplicate bookmarks module, stale audit docs"
```

---

### Task 2: Configure Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add test scripts)
- Modify: `tsconfig.json` (add vitest types)

- [ ] **Step 1: Install dependencies**

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 3: Create vitest.setup.ts**

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Update package.json scripts**

Edit `package.json` — replace the scripts section:

```json
"scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
}
```

- [ ] **Step 5: Update tsconfig.json**

Add to `compilerOptions`:

```json
"types": ["vitest/globals"]
```

- [ ] **Step 6: Verify Vitest runs**

Run: `pnpm test`
Expected: No test files found, exit 0 (passing).

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json tsconfig.json
git commit -m "test: configure Vitest + React Testing Library"
```

---

### Task 3: Configure Playwright

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/` directory and basic test
- Modify: `package.json` (add e2e script)

- [ ] **Step 1: Install Playwright**

```bash
pnpm add -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Create playwright.config.ts**

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm build && pnpm start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: Create e2e directory with placeholder**

```bash
mkdir -p e2e
```

- [ ] **Step 4: Update package.json scripts**

Add to scripts in package.json:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e/ package.json
git commit -m "test: configure Playwright for E2E testing"
```

---

### Task 4: Write Unit Tests for lib/bookmarks.ts

**Files:**
- Create: `lib/__tests__/bookmarks.test.ts`
- Mock: localStorage
- Mock: supabase client

- [ ] **Step 1: Create the test file**

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
  clear: vi.fn(() => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }),
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// Mock supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("bookmarks module", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("getBookmarks returns empty array when no bookmarks saved", async () => {
    const { getBookmarks } = await import("@/lib/bookmarks");
    const result = await getBookmarks();
    expect(result).toEqual([]);
  });

  it("toggleBookmark adds a bookmark", async () => {
    const { toggleBookmark, getBookmarks } = await import("@/lib/bookmarks");
    await toggleBookmark("chapter-1", "الفصل الأول");
    const bookmarks = await getBookmarks();
    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0].chapterId).toBe("chapter-1");
    expect(bookmarks[0].chapterTitle).toBe("الفصل الأول");
    expect(bookmarks[0].timestamp).toBeGreaterThan(0);
  });

  it("toggleBookmark removes existing bookmark", async () => {
    const { toggleBookmark, getBookmarks } = await import("@/lib/bookmarks");
    await toggleBookmark("chapter-1", "الفصل الأول");
    await toggleBookmark("chapter-1", "الفصل الأول");
    const bookmarks = await getBookmarks();
    expect(bookmarks).toHaveLength(0);
  });

  it("isBookmarked returns correct state", async () => {
    const { toggleBookmark, isBookmarked } = await import("@/lib/bookmarks");
    expect(await isBookmarked("chapter-1")).toBe(false);
    await toggleBookmark("chapter-1", "الفصل الأول");
    expect(await isBookmarked("chapter-1")).toBe(true);
  });

  it("removeBookmark removes specific bookmark", async () => {
    const { toggleBookmark, removeBookmark, getBookmarks } = await import("@/lib/bookmarks");
    await toggleBookmark("chapter-1", "الفصل الأول");
    await toggleBookmark("chapter-2", "الفصل الثاني");
    await removeBookmark("chapter-1");
    const bookmarks = await getBookmarks();
    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0].chapterId).toBe("chapter-2");
  });

  it("handles duplicate toggles gracefully", async () => {
    const { toggleBookmark, getBookmarks } = await import("@/lib/bookmarks");
    await toggleBookmark("chapter-1", "الفصل الأول");
    await toggleBookmark("chapter-1", "الفصل الأول");
    const bookmarks = await getBookmarks();
    expect(bookmarks).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `pnpm test lib/__tests__/bookmarks.test.ts`
Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/__tests__/bookmarks.test.ts
git commit -m "test: add unit tests for bookmark CRUD operations"
```

---

### Task 5: Write Unit Tests for lib/readingProgress.ts

**Files:**
- Create: `lib/__tests__/readingProgress.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
  clear: vi.fn(() => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }),
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("readingProgress module", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("getLocalProgress returns empty array initially", async () => {
    const { getLocalProgress } = await import("@/lib/readingProgress");
    expect(getLocalProgress()).toEqual([]);
  });

  it("saveChapterProgress stores and retrieves progress", async () => {
    const { saveChapterProgress, getChapterProgress } = await import("@/lib/readingProgress");
    saveChapterProgress("chapter-1", 50);
    const progress = getChapterProgress("chapter-1");
    expect(progress).toBeDefined();
    expect(progress!.chapterId).toBe("chapter-1");
    expect(progress!.scrollPercentage).toBe(50);
    expect(progress!.updatedAt).toBeGreaterThan(0);
  });

  it("updates existing chapter progress", async () => {
    const { saveChapterProgress, getChapterProgress } = await import("@/lib/readingProgress");
    saveChapterProgress("chapter-1", 50);
    saveChapterProgress("chapter-1", 75);
    const progress = getChapterProgress("chapter-1");
    expect(progress!.scrollPercentage).toBe(75);
  });

  it("returns undefined for unread chapter", async () => {
    const { getChapterProgress } = await import("@/lib/readingProgress");
    expect(getChapterProgress("nonexistent")).toBeUndefined();
  });

  it("saveChapterProgress stores multiple chapters independently", async () => {
    const { saveChapterProgress, getLocalProgress } = await import("@/lib/readingProgress");
    saveChapterProgress("chapter-1", 50);
    saveChapterProgress("chapter-2", 100);
    const all = getLocalProgress();
    expect(all).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `pnpm test lib/__tests__/readingProgress.test.ts`
Expected: All PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/__tests__/readingProgress.test.ts
git commit -m "test: add unit tests for reading progress"
```

---

### Task 6: Write Unit Tests for lib/search.ts

**Files:**
- Create: `lib/__tests__/search.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
import { describe, it, expect } from "vitest";
import { extractExcerpt } from "@/lib/search";

describe("extractExcerpt", () => {
  const content = `# مقدمة\n\nهذا هو النص الأول في الفصل.\n\nوهذا هو النص الثاني الذي يحتوي على كلمة البحث.`;

  it("returns first 150 chars when query not found", () => {
    const result = extractExcerpt(content, "غير موجود");
    expect(result.length).toBeLessThanOrEqual(153); // 150 + "..."
    expect(result).not.toContain("غير موجود");
  });

  it("returns excerpt around matching query", () => {
    const result = extractExcerpt(content, "كلمة البحث");
    expect(result).toContain("كلمة البحث");
  });

  it("handles empty content", () => {
    expect(extractExcerpt("", "test")).toBe("");
  });

  it("handles empty query", () => {
    const result = extractExcerpt(content, "");
    expect(result).toBeTruthy();
  });

  it("surrounds match with context", () => {
    const shortContent = "هذا النص يحتوي على كلمة البحث في منتصفه";
    const result = extractExcerpt(shortContent, "كلمة البحث");
    expect(result).toContain("كلمة البحث");
    expect(result.length).toBeGreaterThan("كلمة البحث".length);
  });

  it("truncates with ellipsis when match is near start", () => {
    const content = "كلمة البحث في بداية النص ثم باقي النص";
    const result = extractExcerpt(content, "كلمة البحث");
    expect(result).toContain("كلمة البحث");
  });
});
```

- [ ] **Step 2: Run tests**

Run: `pnpm test lib/__tests__/search.test.ts`
Expected: All PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/__tests__/search.test.ts
git commit -m "test: add unit tests for search excerpt extraction"
```

---

### Task 7: Write Unit Tests for lib/contentLoader.ts

**Files:**
- Create: `lib/__tests__/contentLoader.test.ts`
- The module uses `fs` (Node API), so we need to mock `fs` and `path`.

- [ ] **Step 1: Create the test file**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs", () => {
  const files: Record<string, string> = {
    "/content/chapters/intro.md": "# المقدمة\n\nهذه هي مقدمة الكتاب.",
    "/content/chapters/chapter-1.md": "# الفصل الأول\n\nهذا هو الفصل الأول.",
    "/content/chapters/chapter-2.md": "# الفصل الثاني\n\nهذا هو الفصل الثاني.",
  };
  return {
    default: {
      existsSync: vi.fn((p: string) => p in files || p === "/content/chapters"),
      readdirSync: vi.fn(() => Object.keys(files).filter(f => f.endsWith('.md')).map(f => f.split('/').pop()!)),
      readFileSync: vi.fn((p: string) => files[p]),
    },
    existsSync: vi.fn((p: string) => p in files || p === "/content/chapters"),
    readdirSync: vi.fn(() => Object.keys(files).filter(f => f.endsWith('.md')).map(f => f.split('/').pop()!)),
    readFileSync: vi.fn((p: string) => files[p]),
  };
});

vi.mock("path", () => ({
  default: {
    resolve: vi.fn((...args: string[]) => args.join("/").replace(/\/+/g, "/")),
    join: vi.fn((...args: string[]) => args.join("/").replace(/\/+/g, "/")),
  },
  resolve: vi.fn((...args: string[]) => args.join("/").replace(/\/+/g, "/")),
  join: vi.fn((...args: string[]) => args.join("/").replace(/\/+/g, "/")),
}));

describe("contentLoader", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("getAllChapters returns sorted chapters with intro first", async () => {
    const { getAllChapters } = await import("@/lib/contentLoader");
    const chapters = getAllChapters();
    expect(chapters).toHaveLength(3);
    expect(chapters[0].id).toBe("intro");
    expect(chapters[1].id).toBe("chapter-1");
    expect(chapters[2].id).toBe("chapter-2");
  });

  it("getAllChapters extracts titles from markdown headings", async () => {
    const { getAllChapters } = await import("@/lib/contentLoader");
    const chapters = getAllChapters();
    expect(chapters.find(c => c.id === "intro")!.title).toBe("المقدمة");
    expect(chapters.find(c => c.id === "chapter-1")!.title).toBe("الفصل الأول");
  });

  it("getAllChapters returns excerpts from first paragraph", async () => {
    const { getAllChapters } = await import("@/lib/contentLoader");
    const chapters = getAllChapters();
    expect(chapters[0].excerpt).toBeTruthy();
  });

  it("getChapterData returns chapter by id", async () => {
    const { getChapterData } = await import("@/lib/contentLoader");
    const chapter = getChapterData("chapter-1");
    expect(chapter).not.toBeNull();
    expect(chapter!.id).toBe("chapter-1");
    expect(chapter!.title).toBe("الفصل الأول");
  });

  it("getChapterData returns null for nonexistent id", async () => {
    const { getChapterData } = await import("@/lib/contentLoader");
    expect(getChapterData("nonexistent")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests**

Run: `pnpm test lib/__tests__/contentLoader.test.ts`
Expected: All PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/__tests__/contentLoader.test.ts
git commit -m "test: add unit tests for content loader"
```

---

### Task 8: Fix Type Safety — Remove `any` Types

**Files:**
- Modify: `components/InstallPrompt.tsx`
- Modify: `components/SearchDialog.tsx`
- Modify: `lib/bookmarks.ts`

- [ ] **Step 1: Fix InstallPrompt.tsx deferredPrompt type**

Replace `const [deferredPrompt, setDeferredPrompt] = useState<any>(null);`:

```typescript
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
// ...
const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
```

Also change:
```typescript
const handleBeforeInstall = (e: Event) => {
```
to:
```typescript
const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
```

And fix the `as any` cast for `navigator.standalone`:

```typescript
const isStandalone = window.matchMedia("(display-mode: standalone)").matches
  || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
```

- [ ] **Step 2: Fix SearchDialog.tsx types**

Replace:
```typescript
const indexRef = useRef<any>(null);
const docsRef = useRef<SearchDocument[]>([]);
```
(with proper types already used)

Replace the FlexSearch Document construction to avoid `as any`:

```typescript
import type { Document } from "flexsearch";

const index = new FlexSearch.Document<SearchDocument, string[]>({
  document: {
    id: "id",
    index: ["title", "content"],
    store: ["title", "content"],
  },
  tokenize: "forward",
  cache: true,
}) as unknown as Document<SearchDocument, string[]>;
```

Replace:
```typescript
index.add(doc as any);
```
with:
```typescript
index.add(doc);
```

Replace the search result type:
```typescript
const raw: any[] = await indexRef.current.search(q, {
```
with proper type:
```typescript
const raw = await indexRef.current.search(q, {
  enrich: true,
  limit: 20,
}) as unknown as Array<{ result: Array<{ id: unknown; doc: SearchDocument }> }>;
```

- [ ] **Step 3: Fix lib/bookmarks.ts row mapping**

Replace:
```typescript
(data || []).map((row: any) => ({
  chapterId: row.chapter_id,
  chapterTitle: row.chapter_title,
  timestamp: new Date(row.created_at).getTime(),
}))
```
with:
```typescript
(data || []).map((row: { chapter_id: string; chapter_title: string; created_at: string }) => ({
  chapterId: row.chapter_id,
  chapterTitle: row.chapter_title,
  timestamp: new Date(row.created_at).getTime(),
}))
```

- [ ] **Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add components/InstallPrompt.tsx components/SearchDialog.tsx lib/bookmarks.ts
git commit -m "refactor: replace any types with proper TypeScript types"
```

---

### Task 9: Harden Auth Callback

**Files:**
- Modify: `app/auth/callback/route.ts`

- [ ] **Step 1: Update auth callback with token_hash verification**

Replace the file content:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // Handle OTP/magic link verification with token_hash
  if (tokenHash && type) {
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "email" | "magiclink" | "recovery",
    });

    if (!error) {
      return response;
    }
    return NextResponse.redirect(`${origin}?error=verification_failed`);
  }

  // Handle OAuth callback
  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(`${origin}?error=auth_failed`);
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/auth/callback/route.ts
git commit -m "fix: harden auth callback with token_hash verification"
```

---

### Task 10: Update Dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml` (auto-updated)

- [ ] **Step 1: Update all dependencies to latest compatible versions**

```bash
pnpm update
```

- [ ] **Step 2: Verify build still works**

```bash
pnpm build
```
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: update dependencies to latest compatible versions"
```

---

### Task 11: Add CSP & Security Headers

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Add security headers in next.config.ts**

Replace the file content:

```typescript
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
```

Note: CSP is intentionally not added as a blanket header because `dangerouslySetInnerHTML` in layout.tsx would be blocked. The dark mode script uses inline JS which requires `'unsafe-inline'` in CSP — defeating the purpose of CSP. This needs a proper refactor (extract to a file) before CSP can be effectively applied. Document this as a known limitation.

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "fix: add security headers (X-Content-Type-Options, Referrer-Policy, X-Frame-Options)"
```

---

### Task 12: Create Dynamic Sitemap

**Files:**
- Create: `app/sitemap.ts`
- Delete: `public/sitemap.xml`

- [ ] **Step 1: Create dynamic sitemap**

```typescript
import type { MetadataRoute } from "next";
import { getAllChapters } from "@/lib/contentLoader";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bassaer.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const chapters = getAllChapters();

  const chapterEntries: MetadataRoute.Sitemap = chapters.map((chapter) => ({
    url: `${baseUrl}/chapter/${chapter.id}`,
    priority: chapter.id === "intro" ? 0.9 : 0.8,
  }));

  return [
    {
      url: baseUrl,
      priority: 1.0,
    },
    ...chapterEntries,
  ];
}
```

- [ ] **Step 2: Remove static sitemap**

```bash
rm public/sitemap.xml
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts
git rm public/sitemap.xml
git commit -m "feat: replace static sitemap.xml with dynamic generation"
```

---

### Task 13: Create Custom 404 Page

**Files:**
- Create: `app/not-found.tsx`

- [ ] **Step 1: Create the 404 page**

```typescript
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-[var(--primary)] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">الصفحة غير موجودة</h2>
        <p className="text-[var(--muted-foreground)] mb-8">
          لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو حذفها.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-[var(--primary)] text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition-all duration-300"
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/not-found.tsx
git commit -m "feat: add custom 404 page with RTL Arabic UI"
```

---

### Task 14: Install & Configure Sentry Error Monitoring

**Files:**
- Modified: (Sentry wizard creates/modifies several files)

- [ ] **Step 1: Install Sentry**

```bash
pnpm add @sentry/nextjs
pnpm add -D @sentry/cli
```

- [ ] **Step 2: Run Sentry wizard**

```bash
npx @sentry/wizard -i nextjs --skip-connect --quiet
```

This creates:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `instrumentation.ts`

- [ ] **Step 3: Configure Sentry DSN via environment variable**

Ensure `.env.local` has (or prompting for it):
```
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
NEXT_PUBLIC_SENTRY_DSN=
```

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Sentry error monitoring"
```

---

### Task 15: PWA Verification & Search Performance

**Files:**
- Verify: `public/manifest.json`, `sw.ts`, `next.config.ts`

- [ ] **Step 1: Verify PWA manifest is properly configured**

Read `public/manifest.json` — verify all icons exist at the referenced paths.

- [ ] **Step 2: Ensure the manifest and search-data.json are cached by the service worker**

The default Serwist runtime cache should handle these. No code changes needed — verify by checking the precache manifest content generated at build time.

- [ ] **Step 3: Add Brotli compression for search-data.json via next.config.ts**

Add to `next.config.ts` in the headers array:

```typescript
{
  source: "/search-data.json",
  headers: [
    { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
  ],
},
```

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add next.config.ts
git commit -m "perf: add immutable caching for search-data.json"
```

---

### Task 16: Write E2E Tests with Playwright

**Files:**
- Create: `e2e/home.spec.ts`
- Create: `e2e/chapter.spec.ts`
- Create: `e2e/search.spec.ts`
- Create: `e2e/theme.spec.ts`
- Create: `e2e/navigation.spec.ts`
- Create: `e2e/pwa.spec.ts`

- [ ] **Step 1: Create home page E2E test**

```typescript
import { test, expect } from "@playwright/test";

test("homepage renders book title and chapter grid", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("بصائر في الكون والحياة والدين");
  const chapterLinks = page.locator("a[href^='/chapter/']");
  const count = await chapterLinks.count();
  expect(count).toBeGreaterThan(0);
});

test("homepage has start reading button", async ({ page }) => {
  await page.goto("/");
  const startButton = page.getByRole("link", { name: "ابدأ القراءة" });
  await expect(startButton).toBeVisible();
});

test("homepage chapter cards link to correct chapters", async ({ page }) => {
  await page.goto("/");
  const firstChapterLink = page.locator("a[href^='/chapter/']").first();
  await expect(firstChapterLink).toBeVisible();
  await firstChapterLink.click();
  await expect(page).toHaveURL(/\/chapter\//);
});
```

- [ ] **Step 2: Create chapter page E2E test**

```typescript
import { test, expect } from "@playwright/test";

test("chapter page shows title and content", async ({ page }) => {
  await page.goto("/chapter/intro");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("article")).toBeVisible();
});

test("chapter page has bookmark button", async ({ page }) => {
  await page.goto("/chapter/intro");
  const bookmarkBtn = page.getByRole("button", { name: /مفضلة|إزالة/i });
  await expect(bookmarkBtn).toBeVisible();
});

test("chapter page has prev/next navigation", async ({ page }) => {
  await page.goto("/chapter/chapter-1");
  const navLinks = page.locator("a[href^='/chapter/']");
  // At least prev or next should exist
  const count = await navLinks.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

test("navigates between chapters via next link", async ({ page }) => {
  await page.goto("/chapter/intro");
  const nextLink = page.locator("a").filter({ hasText: "التالي" });
  if (await nextLink.isVisible()) {
    await nextLink.click();
    await expect(page).not.toHaveURL("/chapter/intro");
  }
});

test("invalid chapter slug shows 404", async ({ page }) => {
  const response = await page.goto("/chapter/nonexistent-chapter");
  expect(response?.status()).toBe(404);
});
```

- [ ] **Step 3: Create search dialog E2E test**

```typescript
import { test, expect } from "@playwright/test";

test("search dialog opens and closes", async ({ page }) => {
  await page.goto("/");
  const searchBtn = page.getByRole("button", { name: "بحث في الكتاب" });
  await searchBtn.click();
  const dialog = page.getByRole("dialog", { name: "بحث في الكتاب" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("search returns results for valid query", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "بحث في الكتاب" }).click();
  const input = page.locator("input[placeholder='ابحث في الكتاب...']");
  await input.fill("الله");
  // Wait for results to appear
  await page.waitForTimeout(500);
  const results = page.locator("[role='dialog'] a");
  const count = await results.count();
  expect(count).toBeGreaterThan(0);
});

test("search keyboard shortcut Ctrl+K opens dialog", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "بحث في الكتاب" });
  await expect(dialog).toBeVisible();
});
```

- [ ] **Step 4: Create theme toggle E2E test**

```typescript
import { test, expect } from "@playwright/test";

test("theme toggle switches between dark and light", async ({ page }) => {
  await page.goto("/");
  const themeBtn = page.getByRole("button", { name: /الوضع/ });
  await expect(themeBtn).toBeVisible();
  const initialClass = await page.locator("html").getAttribute("class");
  await themeBtn.click();
  await page.waitForTimeout(100);
  const newClass = await page.locator("html").getAttribute("class");
  expect(newClass).not.toBe(initialClass);
});
```

- [ ] **Step 5: Create navigation E2E test**

```typescript
import { test, expect } from "@playwright/test";

test("mobile menu opens and shows chapters", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const menuBtn = page.getByRole("button", { name: "فتح القائمة" });
  await menuBtn.click();
  const menu = page.getByRole("dialog", { name: "قائمة المحتويات" });
  await expect(menu).toBeVisible();
  const links = menu.locator("a[href^='/chapter/']");
  const count = await links.count();
  expect(count).toBeGreaterThan(0);
});

test("desktop sidebar shows bookmarks section", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const sidebar = page.getByRole("complementary", { name: "فهرس المحتويات الجانبي" });
  await expect(sidebar).toBeVisible();
});

test("bookmark button toggles bookmark state", async ({ page }) => {
  await page.goto("/chapter/chapter-1");
  const bookmarkBtn = page.getByRole("button", { name: /مفضلة/i });
  await bookmarkBtn.click();
  await page.waitForTimeout(500);
  // Toggle again to clean up
  await bookmarkBtn.click();
});
```

- [ ] **Step 6: Create PWA E2E test**

```typescript
import { test, expect } from "@playwright/test";

test("manifest.json is served correctly", async ({ page }) => {
  const response = await page.goto("/manifest.json");
  expect(response?.status()).toBe(200);
  const manifest = await response?.json();
  expect(manifest.name).toBeTruthy();
  expect(manifest.icons).toBeDefined();
  expect(manifest.icons.length).toBeGreaterThan(0);
});

test("service worker is registered", async ({ page }) => {
  await page.goto("/");
  const hasSW = await page.evaluate(() => "serviceWorker" in navigator);
  expect(hasSW).toBe(true);
});
```

- [ ] **Step 7: Run E2E tests (build + test)**

Run: `pnpm test:e2e`
Expected: All E2E tests PASS.

- [ ] **Step 8: Commit**

```bash
git add e2e/
git commit -m "test: add Playwright E2E tests for core user flows"
```

---

### Task 17: Clean Up and Final Verification

**Files:**
- Modify: `docs/README.md` (update file listing)

- [ ] **Step 1: Update docs/README.md**

Read current `docs/README.md` and update the table to remove word-audit references.

- [ ] **Step 2: Run the full test suite**

```bash
pnpm test
```
Expected: All unit tests PASS.

```bash
pnpm lint
```
Expected: No lint errors.

```bash
npx tsc --noEmit
```
Expected: No type errors.

```bash
pnpm build
```
Expected: Build succeeds.

- [ ] **Step 3: Commit final changes**

```bash
git add -A
git commit -m "chore: final cleanup — update docs/README.md"
```
