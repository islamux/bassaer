# Word Audit Report — Chapter 9

**Report:** `web/docs/word-audit-ch9-report.md`
**MD Source:** `web/content/chapter-9.md`
**Word Source:** `content/ar-basaar.docx` — الجزء الثالث, الباب الثالث: الرد على أشهر شبهات الملحدين (lines 3785–6327)
**MD Title:** الباب التاسع الرد على أشهر شبهات الملحدين
**Mapping:** الجزء الثالث الباب الثالث → MD ch9

## 1. Executive Summary

| Metric | Value |
|---|---|
| MD lines | 2,246 |
| Word lines | ~2,543 |
| Blank lines | 1,114 (49.6%) |
| Broken lam-alif (ل\s+ا) | 325 |
| Quranic markers ﴿﴾ | 59 (Word has 0) |
| H2 sections | 76 |
| Footnotes | 128 |
| Broken footnotes `((` | 138 |
| English text fragments | 118 |
| Estimated OCR issues | ~20% |
| Content fidelity | **Low-Moderate** — largest chapter, most corrupted, systematic footnote corruption |

## 2. OCR Issues

### Title Missing Colon
`# الباب التاسع الرد على أشهر شبهات الملحدين` — missing `:` after التاسع.

### Broken Lam-Alif
**325 instances** — highest of all chapters by far.

### Systematic Footnote Corruption
**138 broken footnotes** — doubled opening parens `((` throughout. This suggests OCR converted Word's `(n)` to `((n)` or `(( ` systematically.

### Ya-Suffix Corruption
Widespread throughout the chapter (many `في → ي` substitutions).

### English Text Fragments
**118 fragments** — highest count, due to scientific/English terminology in this section (the chapter covers many modern atheist arguments with English names and references).

### Section Numbering Issues
Some H2 section numbers may not match the Word's numbering due to OCR dropping numbers.

## 3. Blank Line Bloat
1,114 blank lines out of 2,246 (49.6%).

## 4. Structural Issues
- Maps to الجزء الثالث الباب الثالث (الرد على أشهر شبهات الملحدين) — correct
- 76 H2 sections — Word index lists ~65 sections under this bab. The MD may have split some sections into sub-sections.
- This is the most content-heavy chapter and has the most remaining OCR work

## 5. Quranic Verses
59 ﴿﴾ pairs in MD vs 0 in Word.

---

*End of Report*
