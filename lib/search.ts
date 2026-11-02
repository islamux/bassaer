import { findNormalizedMatch } from "./arabicText.mjs";

export interface SearchDocument {
  id: string;
  title: string;
  content: string;
  slug: string;
}

export interface IndexedSearchDocument extends SearchDocument {
  titleNormalized: string;
  contentNormalized: string;
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
}

export function extractExcerpt(content: string, query: string): string {
  const lines = content.split('\n').filter(l => l.trim());
  const joined = lines.join(' ').replace(/\s+/g, ' ');

  const match = query ? findNormalizedMatch(joined, query) : null;
  if (!match) {
    return joined.slice(0, 150) + (joined.length > 150 ? '...' : '');
  }

  const start = Math.max(0, match.index - 60);
  const end = Math.min(joined.length, match.index + match.length + 120);
  let excerpt = joined.slice(start, end);
  if (start > 0) excerpt = '...' + excerpt;
  if (end < joined.length) excerpt += '...';
  return excerpt;
}
