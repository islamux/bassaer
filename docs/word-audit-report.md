# Word Audit — Consolidated Summary

**Report:** `web/docs/word-audit-report.md`
**Date:** 2026-05-07
**Chapters covered:** ch1–ch12
**Source:** `content/ar-basaar.docx` (Word) vs `web/content/chapter-*.md` (MD)

---

## Chapter-by-Chapter Overview

| Ch | MD Title | Word Source | Lines | Blanks | Blank% | LamAlif | ﴿﴾ | Footnotes | Est. OCR% | Fidelity |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | في الكون والحياة | الجزء الأول | 1,678 | 817 | 48.7% | 142 | 15 | 64 | 15% | Moderate |
| 2 | كيف ظهر الدين | الجزء الثاني - الباب الأول | 667 | 333 | 50.0% | 77 | 19 | 17 | 15% | Moderate |
| 3 | رسول الأميين | الجزء الثاني - الباب الثاني | 1,669 | 833 | 49.9% | 161 | 40 | 8 | 18% | Moderate |
| 4 | الإعجاز العلمي | الجزء الثاني - الباب الثالث | 480 | 240 | 50.0% | 53 | 9 | 12 | 12% | Mod-High |
| 5 | أعظم برهان | الجزء الثاني - الباب الرابع | 471 | 233 | 49.5% | 35 | 18 | 6 | 10% | High |
| 6 | الإخبار بالمغيبات | الجزء الثاني - الباب الخامس | 287 | 121 | 42.2% | 25 | 2 | 6 | 10% | High |
| 7 | تفكيك الشبهة | الجزء الثالث - الباب الأول | 722 | 218 | 30.2% | 106 | 74 | 1 | 12% | Good |
| 8 | الوسواس القهري | الجزء الثالث - الباب الثاني | 195 | 72 | 37.0% | 25 | 1 | 0 | 8% | High |
| 9 | الرد على شبهات الملحدين | الجزء الثالث - الباب الثالث | 2,246 | 1,114 | 49.6% | 325 | 59 | 128 | 20% | Low-Mod |
| 10 | أفكار ضالة | الجزء الثالث - الباب الرابع | 1,633 | 811 | 49.7% | 314 | 68 | 79 | 20% | Low-Mod |
| 11 | يقينية الإيمان | الجزء الثالث - الباب الخامس | 565 | 283 | 50.1% | 57 | 25 | 8 | 15% | Moderate |
| 12 | حقيقة العبودية لله | يقينية الإيمان (subset) | 174 | 86 | 49.4% | 28 | 13 | 6 | 15% | Moderate |
| **Total** | | | **10,787** | **5,161** | **48.0%** | **1,348** | **343** | **335** | **~15%** | |

---

## Key Findings

### 1. Systematic OCR Patterns (All Chapters)

| Issue | Total Count | Severity |
|---|---|---|
| Broken lam-alif `ل\s+ا` | **1,348** | High — most visible Arabic typographic defect |
| Excess blank lines | **5,161 / 10,787 (48%)** | Medium — causes whitespace bloat in rendered HTML |
| Quranic marker conversion (﴿﴾ vs `{}`) | **343** | Low-Medium — deliberate but should be consistent |
| Footnote corruption `((` | **~300+** | Medium — doubled parens, extra spaces |
| Ya-suffix corruption `[word]ي ` | **~300+** | High — distorts Arabic sentence boundaries |

### 2. Structural Alignment

| Source | MD chapters |
|---|---|
| Word الجزء الأول (مقدمة + 42 sections) | ch1 (rearranged, partial) |
| Word الجزء الثاني - الباب الأول: كيف ظهر الدين | ch2 |
| Word الجزء الثاني - الباب الثاني: رسول الأميين | ch3 |
| Word الجزء الثاني - الباب الثالث: الإعجاز العلمي | ch4 |
| Word الجزء الثاني - الباب الرابع: أعظم برهان | ch5 |
| Word الجزء الثاني - الباب الخامس: الإخبار بالمغيبات | ch6 |
| Word الجزء الثالث - الباب الأول: تفكيك الشبهة | ch7 |
| Word الجزء الثالث - الباب الثاني: الوسواس القهري | ch8 |
| Word الجزء الثالث - الباب الثالث: الرد على شبهات الملحدين | ch9 |
| Word الجزء الثالث - الباب الرابع: أفكار ضالة | ch10 |
| Word الجزء الثالث - الباب الخامس: يقينية الإيمان | ch11 |
| يقينية الإيمان subsection (العبادة) | ch12 |

**Alignment is good overall.** Chapter numbering is sequential (باب أول → باب ثاني عشر) while Word resets numbering per جزء. Content mapping is correct for ch2–11. ch1 is a composite. ch12 is an extracted subsection.

### 3. Worst-Affected Chapters (Priority Order)

1. **ch9** — 325 lam-alif, 138 broken footnotes, 2,246 lines, largest chapter
2. **ch10** — 314 lam-alif, 150 broken footnotes
3. **ch3** — 161 lam-alif, 1,669 lines, many Ya-suffix errors
4. **ch1** — 142 lam-alif, structural composite issues

### 4. Best-Preserved Chapters

1. **ch8** — 25 lam-alif, cleanest, correct title
2. **ch6** — 25 lam-alif, lowest blank ratio (42%), good fidelity
3. **ch5** — 35 lam-alif, no English text fragments

---

## Per-Chapter Report Files

| Report | File |
|---|---|
| ch1 | `web/docs/word-audit-ch1-report.md` |
| ch2 | `web/docs/word-audit-ch2-report.md` |
| ch3 | `web/docs/word-audit-ch3-report.md` |
| ch4 | `web/docs/word-audit-ch4-report.md` |
| ch5 | `web/docs/word-audit-ch5-report.md` |
| ch6 | `web/docs/word-audit-ch6-report.md` |
| ch7 | `web/docs/word-audit-ch7-report.md` |
| ch8 | `web/docs/word-audit-ch8-report.md` |
| ch9 | `web/docs/word-audit-ch9-report.md` |
| ch10 | `web/docs/word-audit-ch10-report.md` |
| ch11 | `web/docs/word-audit-ch11-report.md` |
| ch12 | `web/docs/word-audit-ch12-report.md` |

---

## Automated Fix Recommendations

1. **`fix_lam_alif.py`** — regex `ل\s+ا` → `لا` across all `.md` files (~1,348 fixes)
2. **`fix_blank_lines.py`** — collapse 2+ blank lines to 1 (~5,000 blank lines removed)
3. **`fix_ya_suffix.py`** — context-aware `[word]ي ` → `[word] ` or `[word] في ` (~300 fixes)
4. **`fix_footnotes.py`** — `((\d+)` → `(\1)`; normalize spaces (~300 fixes)
5. **`diff_chapter.py`** — structural diff tool for future Word→MD comparisons

---

*End of Report*
