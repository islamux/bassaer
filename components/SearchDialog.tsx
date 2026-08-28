"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowUpDown } from "lucide-react";
import type { SearchDocument, SearchResult } from "@/lib/search";
import { extractExcerpt } from "@/lib/search";

interface SearchIndex {
  search: (query: string, options?: { enrich?: boolean; limit?: number }) => Promise<Array<{ result: Array<{ id: string; doc: SearchDocument }> }>>;
  add: (doc: SearchDocument) => void;
}

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const inputRef = useRef<HTMLInputElement>(null);
  const indexRef = useRef<SearchIndex | null>(null);
  const docsRef = useRef<SearchDocument[]>([]);

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(-1);
    }
  }

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    async function init() {
      const FlexSearch = (await import("flexsearch")).default;
      try {
        const res = await fetch("/search-data.json");
        const docs: SearchDocument[] = await res.json();
        docsRef.current = docs;

        const index = new FlexSearch.Document({
          document: {
            id: "id",
            index: ["title", "content"],
            store: ["title", "content"],
          },
          tokenize: "forward",
          cache: true,
        }) as unknown as SearchIndex;

        for (const doc of docs) {
          index.add(doc);
        }

        indexRef.current = index;
        setIsReady(true);
      } catch (e) {
        console.error("Search init failed:", e);
      }
    }
    init();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() || !indexRef.current) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    const raw = await indexRef.current.search(q, {
      enrich: true,
      limit: 20,
    });

    const seen = new Set<string>();
    const items: SearchResult[] = [];

    for (const field of raw) {
      for (const item of field.result) {
        const doc = item.doc;
        const docId = String(item.id);
        if (!doc || seen.has(docId)) continue;
        seen.add(docId);
        items.push({
          id: docId,
          title: doc.title,
          excerpt: extractExcerpt(doc.content, q),
          slug: docId,
        });
      }
    }

    setResults(items);
    setSelectedIndex(-1);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    doSearch(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, -1));
      return;
    }
    if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
      router.push(`/chapter/${results[selectedIndex].slug}`);
      onClose();
      return;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl mx-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="بحث في الكتاب"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
          <Search className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="ابحث في الكتاب..."
            className="flex-1 bg-transparent border-none outline-none text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            dir="rtl"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
            aria-label="إغلاق البحث"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isReady && query.trim() && (
          <div className="px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">
            جاري تحميل فهرس البحث...
          </div>
        )}

        {isReady && query.trim() && results.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">
            لا توجد نتائج لـ &ldquo;{query}&rdquo;
          </div>
        )}

        {results.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto">
            {results.map((r, i) => (
              <Link
                key={r.id}
                href={`/chapter/${r.slug}`}
                onClick={onClose}
                className={`block px-5 py-3.5 border-b border-[var(--border)] last:border-b-0 transition-colors hover:bg-[var(--muted)] ${
                  i === selectedIndex ? "bg-[var(--muted)]" : ""
                }`}
              >
                <div className="text-sm font-medium text-[var(--primary)] mb-1">
                  {r.title}
                </div>
                <div className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                  {r.excerpt}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-[var(--border)] text-[10px] text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            التنقل
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-[var(--muted)] font-mono">⏎</kbd>
            فتح
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-[var(--muted)] font-mono">Esc</kbd>
            إغلاق
          </span>
        </div>
      </div>
    </div>
  );
}
