# Word Audit Report — Chapter 3

**Report:** `web/docs/word-audit-ch3-report.md`
**MD Source:** `web/content/chapter-3.md`
**Word Source:** `content/ar-basaar.docx` — الجزء الثاني, الباب الثاني: رسول الأميين (lines 1410–2328)
**MD Title:** الباب الثالث — رسول الأميين
**Mapping:** الجزء الثاني الباب الثاني → MD ch3

## 1. Executive Summary

| Metric | Value |
|---|---|
| MD lines | 1,669 |
| Word lines | ~919 |
| Blank lines | 833 (49.9%) |
| Broken lam-alif (ل\s+ا) | 161 |
| Quranic markers ﴿﴾ | 40 (Word has 0) |
| H2 sections | 49 |
| Footnotes | 8 |
| Estimated OCR issues | ~18% |
| Content fidelity | **Moderate** — title missing "رسول الأميين" in H1, fragmented text, systematic corruption |

## 2. OCR Issues

### Missing Chapter Title
Line 1: `# الباب الثالث` — the title `رسول الأميين` appears on line 3 as plain text rather than part of the H1 heading. It should be `# الباب الثالث: رسول الأميين`.

### Broken Lam-Alif
**161 instances** — second-highest among all chapters.

### Ya-Suffix and Word Fragmentation
```
صلى الله عليه وسلمي → صلى الله عليه وسلم في
فهذا استدلالي → فهذا استدلال في (or just فهذا استدلال)
الاستدلالي → الاستدلال في
النبي → النبي (correct in Word)
فيُعطي → missing ياء
يُبشر → missing
```

### Footnote Issues
Only 8 footnotes found in MD for 49 sections — many Word footnotes may have been dropped during OCR conversion.

### Broken English Text
```
Mohammed → Muhammad (inconsistent transliteration)
فيهي → فيه
صلى الله عليه وسلمي في كتب → صلى الله عليه وسلم في كتب
```

## 3. Blank Line Bloat
833 blank lines out of 1,669 (49.9%). The longest chapter after ch9, with nearly identical blank-line density.

## 4. Structural Issues
- MD ch3 maps to الجزء الثاني الباب الثاني (رسول الأميين) — correct
- 49 H2 sections in MD vs ~46 in Word index (close match)
- Some sections appear merged or split due to OCR line-break issues

## 5. Quranic Verses
40 ﴿﴾ pairs in MD vs 0 in Word.

---

*End of Report*
