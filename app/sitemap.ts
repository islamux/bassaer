import type { MetadataRoute } from "next";
import { getAllChapters, getChapterUpdatedAt } from "@/lib/contentLoader";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const chapters = getAllChapters();

  const chapterEntries: MetadataRoute.Sitemap = chapters.map((chapter) => ({
    url: `${SITE_URL}/chapter/${chapter.id}/`,
    lastModified: getChapterUpdatedAt(chapter.id) ?? undefined,
    priority: chapter.id === "intro" ? 0.9 : 0.8,
  }));

  return [
    {
      url: `${SITE_URL}/`,
      priority: 1.0,
    },
    ...chapterEntries,
  ];
}
