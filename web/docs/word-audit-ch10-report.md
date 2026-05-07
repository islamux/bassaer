# Word Audit Report — Chapter 10

**Report:** `web/docs/word-audit-ch10-report.md`
**MD Source:** `web/content/chapter-10.md`
**Word Source:** `content/ar-basaar.docx` — الجزء الثالث, الباب الرابع: أفكار ضالة (lines 6328–8660)
**MD Title:** الباب العاشر: أفكار ضالة
**Mapping:** الجزء الثالث الباب الرابع → MD ch10

## 1. Executive Summary

| Metric | Value |
|---|---|
| MD lines | 1,633 |
| Word lines | ~2,333 |
| Blank lines | 811 (49.7%) |
| Broken lam-alif (ل\s+ا) | 314 |
| Quranic markers ﴿﴾ | 68 (Word has 0) |
| H2 sections | 58 |
| Footnotes | 79 |
| Broken footnotes `((` | 150 |
| English text fragments | 76 |
| Estimated OCR issues | ~20% |
| Content fidelity | **Low-Moderate** — second-most corrupted chapter, same systematic issues as ch9 |

## 2. OCR Issues

### Title is Correct
`# الباب العاشر: أفكار ضالة` — fully correct.

### Broken Lam-Alif
**314 instances** — second-highest of all chapters.

### Systematic Footnote Corruption
**150 broken footnotes** `((` — the worst of any chapter. The OCR systematically doubled opening parentheses.

### Ya-Suffix and Word Fragmentation
Widespread. The chapter covers ideological topics (التنوير) with complex Arabic that the OCR struggled to parse.

### Missing Punctuation
Long paragraphs with corrupted or missing Arabic punctuation (periods, commas).

## 3. Blank Line Bloat
811 blank lines out of 1,633 (49.7%).

## 4. Structural Issues
- Maps to الجزء الثالث الباب الرابع (أفكار ضالة) — correct
- 58 H2 sections vs ~35 in Word index. MD appears to have split many Word sections into finer subsections.
- Content order generally preserved

## 5. Footnotes
79 footnotes in MD but 150 broken `((` marks. This means roughly half the footnotes have doubled opening parens that need normalization.

---

*End of Report*
