import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("uses trailing-slash URLs that match the canonical tags", () => {
    const entries = sitemap();

    expect(entries[0].url.endsWith("/")).toBe(true);

    for (const entry of entries.slice(1)) {
      expect(entry.url).toMatch(/\/chapter\/[^/]+\/$/);
    }
  });

  it("includes a lastModified date for every chapter", () => {
    const entries = sitemap();

    for (const entry of entries.slice(1)) {
      expect(entry.lastModified).toBeInstanceOf(Date);
    }
  });
});
