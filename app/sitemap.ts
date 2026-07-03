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
