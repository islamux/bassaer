# Word Audit Report — Chapter 2

**Report:** `web/docs/word-audit-ch2-report.md`
**MD Source:** `web/content/chapter-2.md`
**Word Source:** `content/ar-basaar.docx` — الجزء الثاني, الباب الأول: كيف ظهر الدين؟ (lines 1087–1409)
**MD Title:** الباب الثاني كيف ظهر الدين
**Mapping:** الجزء الثاني الباب الأول → MD ch2

## 1. Executive Summary

| Metric | Value |
|---|---|
| MD lines | 667 |
| Word lines | ~323 |
| Blank lines | 333 (50.0%) |
| Broken lam-alif (ل\s+ا) | 77 |
| Quranic markers ﴿﴾ | 19 (Word has 0) |
| H2 sections | 16 |
| Footnotes | 17 |
| Estimated OCR issues | ~15% |
| Content fidelity | **Moderate** — truncated title, fragmented paragraphs, systematic OCR corruption |

## 2. OCR Issues

### Title Truncation
Line 1: just `في` — the H1 title line is truncated. Should be `# الباب الثاني: كيف ظهر الدين` but only the first word `في` remains. Then line 3 has `# الباب الثاني كيف ظهر الدين` as the actual heading but it's on the wrong line, leaving a bare `في` floating.

### Broken Lam-Alif
**77 instances** of `ل\s+ا` → should be `لا`. Same root cause as ch1.

### Ya-Suffix Corruption
```
الملحدي → الملحد
فالن ظُ م القَ بَليةي → فالنظم القبلية  
الديني → الدين
بدايةي → بداية في
تارية → تاريخية (missing راء)
ر حام → استرحام (missing است)
```

### Word Boundary Loss
```
أن هناك أو → أن هناك أمما (missing م)
فيُعري → يُعرف
منبررضيين → المنتصرين
نصَسَ ق → نسق
الأقاب → الألقاب
بأن ساب → بأنساب
```

### Missing Punctuation
Word uses Arabic commas and periods properly. MD ch2 has irregular spacing around punctuation.

### Footnote Corruption
```
( 83) → (83) — extra space
( 85 ) → extra spaces
```

## 3. Blank Line Bloat
333 blank lines out of 667 (50.0%). All section boundaries have 2–3 blank lines. Will cause excessive vertical whitespace when rendered.

## 4. Structural Issues
- MD ch2 maps to الجزء الثاني الباب الأول (كيف ظهر الدين) — correct mapping, no structural drift
- Sections 1–15 in MD match the Word section numbering
- Major content present but fragmented with OCR artifacts

## 5. Quranic Verses
19 ﴿﴾ pairs in MD vs 0 in Word (Word uses curly braces). Consistent conversion needed.

---

*End of Report*
