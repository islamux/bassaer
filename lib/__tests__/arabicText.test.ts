import { describe, it, expect } from "vitest";
import { normalizeArabic, findNormalizedMatch } from "@/lib/arabicText.mjs";

describe("normalizeArabic", () => {
  it("strips tashkeel and normalizes alef/ya/ta-marbuta", () => {
    expect(normalizeArabic("بَصَائِر")).toBe("بصاير");
    expect(normalizeArabic("أحمد")).toBe("احمد");
    expect(normalizeArabic("مصطفى")).toBe("مصطفي");
    expect(normalizeArabic("مكتبة")).toBe("مكتبه");
  });

  it("normalizes Arabic-Indic digits and collapses whitespace", () => {
    expect(normalizeArabic("١٢٣ ٤٥")).toBe("123 45");
    expect(normalizeArabic("  نص   طويل  ")).toBe("نص طويل");
  });

  it("removes tatweel and bidi control marks", () => {
    expect(normalizeArabic("مـكـتـب")).toBe("مكتب");
    expect(normalizeArabic("\u200fنص\u200e")).toBe("نص");
  });
});

describe("findNormalizedMatch", () => {
  it("maps a diacritized query back to raw offsets", () => {
    expect(findNormalizedMatch("كتاب بصائر في الكون", "بَصَائِر")).toEqual({
      index: 5,
      length: 5,
    });
  });

  it("matches across variant spellings", () => {
    expect(findNormalizedMatch("مكتبة", "مكتبه")).toEqual({ index: 0, length: 5 });
    expect(findNormalizedMatch("مصطفى", "مصطفي")).toEqual({ index: 0, length: 5 });
  });

  it("accounts for leading whitespace and line breaks", () => {
    expect(findNormalizedMatch("  نص", "نص")).toEqual({ index: 2, length: 2 });
    expect(findNormalizedMatch("سطر\n\nبصائر", "بصائر")).toEqual({ index: 5, length: 5 });
  });

  it("treats every whitespace character like normalizeArabic does", () => {
    expect(findNormalizedMatch("سطر\n\nبصائر", "سطر بصائر")).toEqual({ index: 0, length: 10 });
    expect(findNormalizedMatch("سطر\tبصائر", "سطر بصائر")).toEqual({ index: 0, length: 9 });
    expect(findNormalizedMatch("سطر\u00a0بصائر", "سطر بصائر")).toEqual({ index: 0, length: 9 });
  });

  it("returns null when there is no match", () => {
    expect(findNormalizedMatch("كتاب", "غير")).toBeNull();
    expect(findNormalizedMatch("كتاب", "")).toBeNull();
  });

  it("stays fast on a full chapter-sized document", () => {
    const document = "كتاب بصائر في الكون والحياة والدين. ".repeat(8000);
    expect(document.length).toBeGreaterThan(250_000);

    const started = performance.now();
    const match = findNormalizedMatch(document, "الله");
    const elapsed = performance.now() - started;

    expect(match).toBeNull();
    expect(elapsed).toBeLessThan(200);
  });
});
