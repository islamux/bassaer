# Word Audit Report — Chapter 5

**Report:** `web/docs/word-audit-ch5-report.md`
**MD Source:** `web/content/chapter-5.md`
**Word Source:** `content/ar-basaar.docx` — الجزء الثاني, الباب الرابع: أعظم برهان على صحة الإسلام (lines 2567–2790)
**MD Title:** الباب الخامس — أعظم برهان على صحة الإسلام
**Mapping:** الجزء الثاني الباب الرابع → MD ch5

## 1. Executive Summary

| Metric | Value |
|---|---|
| MD lines | 471 |
| Word lines | ~224 |
| Blank lines | 233 (49.5%) |
| Broken lam-alif (ل\s+ا) | 35 |
| Quranic markers ﴿﴾ | 18 (Word has 0) |
| H2 sections | 9 |
| Footnotes | 6 |
| English text fragments | 0 |
| Estimated OCR issues | ~10% |
| Content fidelity | **High** — fewest OCR issues among ch2–6, title fragmented but content is cleanest |

## 2. OCR Issues

### Fragmented Title
Line 1: `# الباب الخامس`. Line 3: `على ٍ أعظمُ بُرهان الإسلام صحة`. The article `على` and the broken word `ٍ` suggest the title was split during OCR. Should be `# الباب الخامس: أعظم برهان على صحة الإسلام`.

### Broken Lam-Alif
**35 instances** — lowest among ch2–6.

### Specific Artifacts
```
صلى الله عليه وسلمي → صلى الله عليه وسلم في
في الحديث المتفق على صحتهي → في الحديث المتفق على صحته في
```

## 3. Blank Line Bloat
233 blank lines out of 471 (49.5%).

## 4. Structural Issues
- Maps to الجزء الثاني الباب الرابع (أعظم برهان) — correct
- 9 H2 sections vs ~8 in Word index (close match, some sections may have been merged)
- Content order preserved

## 5. Quranic Verses
18 ﴿﴾ pairs in MD vs 0 in Word.

---

*End of Report*
