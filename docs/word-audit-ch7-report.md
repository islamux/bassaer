# Word Audit Report — Chapter 7

**Report:** `web/docs/word-audit-ch7-report.md`
**MD Source:** `web/content/chapter-7.md`
**Word Source:** `content/ar-basaar.docx` — الجزء الثالث, الباب الأول: تفكيك الشبهة (lines 2951–3468)
**MD Title:** الباب السابع: تفكيك الشبهة
**Mapping:** الجزء الثالث الباب الأول → MD ch7

## 1. Executive Summary

| Metric | Value |
|---|---|
| MD lines | 722 |
| Word lines | ~518 |
| Blank lines | 218 (30.2%) |
| Broken lam-alif (ل\s+ا) | 106 |
| Quranic markers ﴿﴾ | 74 (Word has 0) |
| H2 sections | 18 |
| Footnotes | 1 |
| English text fragments | 6 |
| Estimated OCR issues | ~12% |
| Content fidelity | **Good** — lowest blank-line ratio, title is correct, most Quranic verses of any chapter |

## 2. OCR Issues

### Title is Correct
`# الباب السابع: تفكيك الشبهة` — fully correct, no truncation.

### Broken Lam-Alif
**106 instances** — moderate.

### Specific Artifacts
```
معتذر → معتبر (possible)
النفس → correct in context
```

### Footnote Issues
Only 1 footnote found for 18 sections. Many Word footnotes may have been stripped.

## 3. Blank Line Bloat
218 blank lines out of 722 (30.2%) — best ratio of all chapters. Still higher than normal (should be ~5%).

## 4. Structural Issues
- Maps to الجزء الثالث الباب الأول (تفكيك الشبهة) — correct
- 18 H2 sections vs ~10 in Word index. The MD appears to have split some Word sections into subsections.
- Content order generally preserved

## 5. Quranic Verses
74 ﴿﴾ pairs — the highest count of any chapter. Word has 0.

---

*End of Report*
