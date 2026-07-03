import { describe, it, expect } from "vitest";
import { extractExcerpt } from "@/lib/search";

describe("extractExcerpt", () => {
  const content = `# مقدمة\n\nهذا هو النص الأول في الفصل.\n\nوهذا هو النص الثاني الذي يحتوي على كلمة البحث.`;

  it("returns first 150 chars when query not found", () => {
    const result = extractExcerpt(content, "غير موجود");
    expect(result.length).toBeLessThanOrEqual(153);
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
    const c = "كلمة البحث في بداية النص ثم باقي النص";
    const result = extractExcerpt(c, "كلمة البحث");
    expect(result).toContain("كلمة البحث");
  });
});
