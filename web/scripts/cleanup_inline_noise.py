#!/usr/bin/env python3
"""
cleanup_inline_noise.py
=======================
Second-pass cleanup for remaining inline OCR noise in Bassaer chapter files.

Problems remaining after quran_restoration_v2.py:
  1. Short 2-4 letter glyph sequences (e.g. "لح", "بم", "فح", "ظمعج")
     immediately preceding "سورة NAME" – they are OCR fragments and should
     be removed.
  2. Verse citations in bracket form ﴾ N ﴿ سورة NAME that have a stray dot
     in the middle (e.g. "﴾ N ﴿ سورة.\n NAME").
  3. Lines that end with just a surah name broken across two lines.
"""

import re
from pathlib import Path

CONTENT_DIR = Path(__file__).parent.parent / "content"

# Build surah names list (longest first so regex is greedy)
SURAH_NAMES = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة",
    "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
    "هود", "يوسف", "الرعد", "إبراهيم", "الحجر",
    "النحل", "الإسراء", "الكهف", "مريم", "طه",
    "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان",
    "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
    "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر",
    "يس", "الصافات", "ص", "الزمر", "غافر",
    "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية",
    "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
    "الذاريات", "الطور", "النجم", "القمر", "الرحمن",
    "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
    "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق",
    "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
    "نوح", "الجن", "المزمل", "المدثر", "القيامة",
    "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
    "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج",
    "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
    "الشمس", "الليل", "الضحى", "الشرح", "التين",
    "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
    "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل",
    "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
    "المسد", "الإخلاص", "الفلق", "الناس",
    # Aliases / alternate spellings found in source
    "الإشاء",   # OCR ← الإسراء
    "الأنفلا",  # OCR ← الأنفال
]

_NAMES_PAT = "|".join(sorted(SURAH_NAMES, key=len, reverse=True))

# ────────────────────────────────────────────────────────────────────────────
# Pattern: 2–6 Arabic chars (OCR noise) + optional diacritics + "سورة NAME"
# Captures: (noise)(surah_name)
# We will REMOVE the noise, keep "سورة NAME"
# ────────────────────────────────────────────────────────────────────────────
# Match 2-8 Arabic letters (no spaces) that aren't proper words before سورة,
# preceded by a word boundary or space/punctuation.
NOISE_BEFORE_SURAH = re.compile(
    r'(?<![ا-ي])'           # not preceded by more Arabic (avoid eating real words)
    r'[\u0600-\u06FF\u064B-\u065F]{2,8}'  # 2-8 Arabic chars + diacritics
    r'(?=\s+سورة\s+(?:' + _NAMES_PAT + r'))',
    re.UNICODE,
)

# Pattern: "سورة.\n NAME" or "سورة. NAME" → "سورة NAME"
BROKEN_SURAH = re.compile(
    r'سورة\s*\.\s*\n?\s*(' + _NAMES_PAT + r')',
    re.UNICODE,
)

# Pattern: bracket verse citation with dot between ﴿ and سورة
# e.g.: ﴾ 5 ﴿ سورة.\n الصف  → [سورة الصف: 5]
BRACKET_DOT_SURAH = re.compile(
    r'(?:﴾|﴿)\s*([٠-٩\d]{1,3})\s*(?:﴾|﴿)\s*(?:\.|\s)*\n?\s*سورة\s*\.?\s*\n?\s*(' + _NAMES_PAT + r')',
    re.UNICODE,
)

def arabic_to_int(s):
    return int(s.translate(str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")))


def process(text: str) -> tuple[str, int]:
    changes = 0
    original = text

    # 1. Fix "سورة. NAME" split across lines / dots
    def fix_broken(m):
        nonlocal changes; changes += 1
        return f"سورة {m.group(1)}"
    text = BROKEN_SURAH.sub(fix_broken, text)

    # 2. Fix ﴾ N ﴿ سورة. NAME patterns
    def fix_bracket_dot(m):
        nonlocal changes; changes += 1
        num = arabic_to_int(m.group(1))
        name = m.group(2).strip()
        return f"[سورة {name}: {num}]"
    text = BRACKET_DOT_SURAH.sub(fix_bracket_dot, text)

    # 3. Remove short OCR noise tokens before "سورة NAME"
    def remove_noise(m):
        nonlocal changes; changes += 1
        return ""
    text = NOISE_BEFORE_SURAH.sub(remove_noise, text)

    # 4. Fix "الإشاء" → "الإسراء" (common OCR alias)
    if "الإشاء" in text:
        text = text.replace("الإشاء", "الإسراء")
        changes += 1

    # 5. Fix "الأنفلا" → "الأنفال" (common OCR alias)
    if "الأنفلا" in text:
        text = text.replace("الأنفلا", "الأنفال")
        changes += 1

    # 6. Normalise multiple spaces
    text = re.sub(r'[ \t]{2,}', ' ', text)

    return text, changes


def main():
    total = 0
    for f in sorted(CONTENT_DIR.glob("*.md")):
        original = f.read_text(encoding="utf-8")
        new, n = process(original)
        if new != original:
            f.write_text(new, encoding="utf-8")
            print(f"{f.name}: {n} fix(es)")
            total += n
        else:
            print(f"{f.name}: no changes")
    print(f"\nTotal fixes: {total}")


if __name__ == "__main__":
    main()
