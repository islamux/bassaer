# Word Audit Report — Chapter 12

**Report:** `web/docs/word-audit-ch12-report.md`
**MD Source:** `web/content/chapter-12.md`
**Word Source:** `content/ar-basaar.docx` — الجزء الثالث, الباب الخامس: يقينية الإيمان, subsection on العبادة (lines 8661–9008, sections 117–122)
**MD Title:** الباب الثاني عشر: حقيقة العبودية لله
**Mapping:** يقينية الإيمان subsection (حقيقة العبودية) → MD ch12

## 1. Executive Summary

| Metric | Value |
|---|---|
| MD lines | 174 |
| Word lines | ~50 (relevant subsection) |
| Blank lines | 86 (49.4%) |
| Broken lam-alif (ل\s+ا) | 28 |
| Quranic markers ﴿﴾ | 13 (Word has 0) |
| H2 sections | 7 |
| Footnotes | 6 |
| Broken footnotes `((` | 11 |
| English text fragments | 3 |
| Estimated OCR issues | ~15% |
| Content fidelity | **Moderate** — title is extra-biblical (not in Word as a separate chapter), content pulled from يقينية الإيمان |

## 2. OCR Issues

### Extra Chapter Title
`# الباب الثاني عشر: حقيقة العبودية لله` — this chapter **does not exist as a separate entity** in the Word source. It appears to be an extracted subset of يقينية الإيمان, specifically the sections on العبادة (sections 117–122). This is a legitimate structural reorganization by the author, not an OCR error.

### Broken Lam-Alif
**28 instances** — moderate for a 174-line chapter.

### Specific Artifacts
```
صلى الله عليه وسلمي → صلى الله عليه وسلم في
في الحديث المتفق على صحتِهي → في الحديث المتفق على صحته في
رضي الله عنه → formatting issues
في كتابه ييذٰرٰىٰ ٍّ ّٰ بنيبيترتز → corrupted Quranic verse text
كلش → كل شيء (OCR collapsed the ligature)
أنبي → أنا (OCR misread)
أسبابعدة → أسباب عدة
السببين→ missing word boundary
أساسيينِ → أساسيين
لكوبن → لكوني
لنا → missing word boundary in "أن لنا"
بنيبيترتز → Arabic text corruption (should be a Quranic verse reference)
```

## 3. Blank Line Bloat
86 blank lines out of 174 (49.4%).

## 4. Structural Issues
- This chapter is an **extracted subset** of يقينية الإيمان, specifically sections about العبادة
- 7 H2 sections correspond to Word sections 117–122 (ماهي العبادة, أركانها, شروطها, ثمراتها, etc.)
- The chapter numbering (12) and title (حقيقة العبودية لله) are editorial additions by the author to organize content
- No structural drift — the extraction is intentional

## 5. Quranic Verse Corruption
Line 5 contains heavily corrupted Arabic: `ييذٰرٰىٰ ٍّ ّٰ بنيبيترتز` — this should be a proper Quranic verse reference. The presentation-form characters and garbled text suggest severe OCR damage to this verse.

---

*End of Report*
