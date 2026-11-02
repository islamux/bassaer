import { describe, it, expect } from "vitest";
import { toSearchContent } from "../../scripts/build-search-index.mjs";

describe("toSearchContent", () => {
  it("drops headings, quotes and image markdown", () => {
    const raw = "# عنوان\n\n> اقتباس\n\n![alt](/images/x.png)\n\nنص";
    expect(toSearchContent(raw)).toBe("نص");
  });

  it("keeps paragraph text on one line", () => {
    expect(toSearchContent("سطر أول\nسطر ثانٍ")).toBe("سطر أول سطر ثانٍ");
  });
});
