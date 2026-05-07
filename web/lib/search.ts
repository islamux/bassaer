export interface SearchDocument {
  id: string;
  title: string;
  content: string;
  slug: string;
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

  const idx = joined.indexOf(query);
  if (idx === -1) {
    return joined.slice(0, 150) + (joined.length > 150 ? '...' : '');
  }

  const start = Math.max(0, idx - 60);
  const end = Math.min(joined.length, idx + query.length + 120);
  let excerpt = joined.slice(start, end);
  if (start > 0) excerpt = '...' + excerpt;
  if (end < joined.length) excerpt += '...';
  return excerpt;
}
