#!/usr/bin/env python3
"""
quran_restoration_v2.py
=======================
Restores corrupted / OCR-garbled Quranic verse citations in the Bassaer
chapter markdown files.

Strategy:
  1. Scan each .md file for lines that contain Arabic presentation-form glyph
     noise followed by a surah marker like:  ﴾ N ﴿ سورة NAME
     OR lines that have glyph junk inline followed by سورة NAME (with no
     verse number – we leave those for manual review).

  2. For every match that carries a verse number AND a recognised surah name,
     fetch the clean text from alquran.cloud (ar.clean edition – no tashkeel)
     and replace the whole noise+citation block with:
         ﴿ <verified ayah text> ﴾ [سورة NAME: N]

  3. Also strip any residual Arabic presentation-form glyph sequences that are
     NOT valid Quranic text (block U+FB50..U+FDFF and U+FE70..FEFF).

  4. Save changed files and print a summary.
"""

import re
import os
import time
import unicodedata
from pathlib import Path

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    print("WARNING: 'requests' not installed – API fetching disabled.")

CONTENT_DIR = Path(__file__).parent.parent / "content"

# ────────────────────────────────────────────────────────────────────────────
# Surah name → number
# ────────────────────────────────────────────────────────────────────────────
SURAH_MAP = {
    "الفاتحة": 1, "البقرة": 2, "آل عمران": 3, "النساء": 4, "المائدة": 5,
    "الأنعام": 6, "الأعراف": 7, "الأنفال": 8, "التوبة": 9, "يونس": 10,
    "هود": 11, "يوسف": 12, "الرعد": 13, "إبراهيم": 14, "الحجر": 15,
    "النحل": 16, "الإسراء": 17, "الكهف": 18, "مريم": 19, "طه": 20,
    "الأنبياء": 21, "الحج": 22, "المؤمنون": 23, "النور": 24, "الفرقان": 25,
    "الشعراء": 26, "النمل": 27, "القصص": 28, "العنكبوت": 29, "الروم": 30,
    "لقمان": 31, "السجدة": 32, "الأحزاب": 33, "سبأ": 34, "فاطر": 35,
    "يس": 36, "الصافات": 37, "ص": 38, "الزمر": 39, "غافر": 40,
    "فصلت": 41, "الشورى": 42, "الزخرف": 43, "الدخان": 44, "الجاثية": 45,
    "الأحقاف": 46, "محمد": 47, "الفتح": 48, "الحجرات": 49, "ق": 50,
    "الذاريات": 51, "الطور": 52, "النجم": 53, "القمر": 54, "الرحمن": 55,
    "الواقعة": 56, "الحديد": 57, "المجادلة": 58, "الحشر": 59, "الممتحنة": 60,
    "الصف": 61, "الجمعة": 62, "المنافقون": 63, "التغابن": 64, "الطلاق": 65,
    "التحريم": 66, "الملك": 67, "القلم": 68, "الحاقة": 69, "المعارج": 70,
    "نوح": 71, "الجن": 72, "المزمل": 73, "المدثر": 74, "القيامة": 75,
    "الإنسان": 76, "المرسلات": 77, "النبأ": 78, "النازعات": 79, "عبس": 80,
    "التكوير": 81, "الانفطار": 82, "المطففين": 83, "الانشقاق": 84, "البروج": 85,
    "الطارق": 86, "الأعلى": 87, "الغاشية": 88, "الفجر": 89, "البلد": 90,
    "الشمس": 91, "الليل": 92, "الضحى": 93, "الشرح": 94, "التين": 95,
    "العلق": 96, "القدر": 97, "البينة": 98, "الزلزلة": 99, "العاديات": 100,
    "القارعة": 101, "التكاثر": 102, "العصر": 103, "الهمزة": 104, "الفيل": 105,
    "قريش": 106, "الماعون": 107, "الكوثر": 108, "الكافرون": 109, "النصر": 110,
    "المسد": 111, "الإخلاص": 112, "الفلق": 113, "الناس": 114,
    # alternate spellings that appear in the source
    "آل‌عمران": 3, "الاسراء": 17, "الأنفال": 8,
}

# Arabic-Indic digit map
AR_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")

# Regex: presentation-form glyphs (U+FB50–FDFF, U+FE70–FEFF)
PRES_GLYPH = r'[\uFB50-\uFDFF\uFE70-\uFEFF]'

# Cache so we don't hit the API twice for the same verse
_AYAH_CACHE: dict[tuple, str | None] = {}


def arabic_to_int(s: str) -> int | None:
    """Convert Arabic-Indic or Arabic numeral string to int."""
    try:
        return int(s.translate(AR_DIGITS))
    except (ValueError, TypeError):
        return None


def get_ayah(surah: int, ayah: int) -> str | None:
    """Fetch verse text from alquran.cloud (ar.clean = no tashkeel)."""
    if not HAS_REQUESTS:
        return None
    key = (surah, ayah)
    if key in _AYAH_CACHE:
        return _AYAH_CACHE[key]
    try:
        url = f"https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/ar.clean"
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            text = r.json()["data"]["text"]
            _AYAH_CACHE[key] = text
            time.sleep(0.05)   # be gentle with the API
            return text
    except Exception as e:
        print(f"  API error {surah}:{ayah} – {e}")
    _AYAH_CACHE[key] = None
    return None


def format_citation(ayah_text: str, surah_name: str, ayah_num: int) -> str:
    return f"﴿ {ayah_text} ﴾ [سورة {surah_name}: {ayah_num}]"


# ────────────────────────────────────────────────────────────────────────────
# Pattern 1 – clean verse already wrapped in ornate brackets, possibly with
# a glyph blob just before or inside:
#   (glyph junk)? ﴾? VERSE_TEXT ﴿ ﴾ N ﴿ سورة NAME
#   or: (glyph junk) ﴾ N ﴿ سورة NAME  (no verse text – only number+name)
# ────────────────────────────────────────────────────────────────────────────
# Surah names joined with |
_SURAH_NAMES = "|".join(sorted(SURAH_MAP.keys(), key=len, reverse=True))

# Matches: <optional glyph noise> ﴾ N ﴿ سورة NAME
# Group 1 = glyph blob (may be empty)
# Group 2 = verse number (arabic/western digits, possibly padded)
# Group 3 = surah name
PAT_NUM_THEN_SURAH = re.compile(
    r'((?:' + PRES_GLYPH + r'|[َُِّ]){3,})?'   # optional glyph junk
    r'\s*(?:﴾|﴿)\s*'
    r'([٠-٩\d]{1,3}(?:[٠]\d?)?)'               # verse number
    r'\s*(?:﴾|﴿)\s*'
    r'سورة\s+'
    r'(' + _SURAH_NAMES + r')',
    re.UNICODE,
)

# Matches inline: GLYPH_BLOB ﴾ N ﴿ سورة NAME  (where the blob IS the verse)
PAT_BLOB_VERSE = re.compile(
    r'((?:' + PRES_GLYPH + r'[\u0600-\u06FF\s]*){5,})'  # blob (≥5 pres glyphs)
    r'\s*(?:﴾|﴿)\s*'
    r'([٠-٩\d]{1,3})'
    r'\s*(?:﴾|﴿)\s*'
    r'سورة\s+(' + _SURAH_NAMES + r')',
    re.UNICODE,
)

# Matches: ﴾ VERSE ﴿ ﴾ N ﴿ سورة NAME  (verse already recovered, just regularise brackets)
PAT_CLEAN_VERSE = re.compile(
    r'﴾\s*([^﴾﴿]{10,}?)\s*﴿\s*﴾\s*([٠-٩\d]{1,3})\s*﴿\s*سورة\s+(' + _SURAH_NAMES + r')',
    re.UNICODE,
)

# Matches: (glyph junk or normal Arabic chars) a dot / space then سورة NAME  (no number)
# These we just strip the glyph junk and leave the surah name
PAT_GLYPH_BEFORE_SURAH_NO_NUM = re.compile(
    r'((?:' + PRES_GLYPH + r'[\u0600-\u06FF\s,.]*){4,})'
    r'(?:\.|\s)*سورة\s+(' + _SURAH_NAMES + r')',
    re.UNICODE,
)


def strip_pres_forms(text: str) -> str:
    """Remove all Arabic presentation-form characters (U+FB50–FDFF, U+FE70–FEFF)."""
    return re.sub(PRES_GLYPH, '', text)


def restore_verses(content: str) -> tuple[str, int, int]:
    """
    Returns (new_content, n_restored, n_cleaned).
    n_restored = verses fetched from API and inserted.
    n_cleaned  = glyph blobs removed without API (no verse number found).
    """
    restored = 0
    cleaned = 0

    # ── Pass 1: lines with glyph blob + verse number + surah name (fetch API) ──
    def replace_blob_verse(m: re.Match) -> str:
        nonlocal restored
        num_str = m.group(2)
        surah_name = m.group(3).strip()
        ayah_num = arabic_to_int(num_str)
        surah_num = SURAH_MAP.get(surah_name)
        if ayah_num and surah_num:
            text = get_ayah(surah_num, ayah_num)
            if text:
                restored += 1
                print(f"  ✓ {surah_name} {ayah_num}")
                return format_citation(text, surah_name, ayah_num)
        # fallback: just strip the glyph blob but keep citation
        return f"﴾ {ayah_num or '?'} ﴿ سورة {surah_name}"

    content = PAT_BLOB_VERSE.sub(replace_blob_verse, content)

    # ── Pass 2: number-then-surah pattern (e.g. from previous partial fix) ──
    def replace_num_then_surah(m: re.Match) -> str:
        nonlocal restored
        num_str = m.group(2)
        surah_name = m.group(3).strip()
        ayah_num = arabic_to_int(num_str)
        surah_num = SURAH_MAP.get(surah_name)
        if ayah_num and surah_num:
            text = get_ayah(surah_num, ayah_num)
            if text:
                restored += 1
                print(f"  ✓ {surah_name} {ayah_num}")
                return format_citation(text, surah_name, ayah_num)
        return m.group(0)  # leave as-is if no API result

    content = PAT_NUM_THEN_SURAH.sub(replace_num_then_surah, content)

    # ── Pass 3: regularise already-recovered clean verses ──
    def replace_clean_verse(m: re.Match) -> str:
        nonlocal restored
        verse_text = m.group(1).strip()
        num_str = m.group(2)
        surah_name = m.group(3).strip()
        ayah_num = arabic_to_int(num_str)
        surah_num = SURAH_MAP.get(surah_name)
        # verify with API if possible
        if ayah_num and surah_num and HAS_REQUESTS:
            api_text = get_ayah(surah_num, ayah_num)
            if api_text:
                restored += 1
                return format_citation(api_text, surah_name, ayah_num)
        # keep existing text, just normalise brackets
        return format_citation(verse_text, surah_name, ayah_num or 0)

    content = PAT_CLEAN_VERSE.sub(replace_clean_verse, content)

    # ── Pass 4: glyph blobs before سورة with NO verse number → strip blob ──
    def replace_glyph_no_num(m: re.Match) -> str:
        nonlocal cleaned
        surah_name = m.group(2).strip()
        cleaned += 1
        return f"سورة {surah_name}"

    content = PAT_GLYPH_BEFORE_SURAH_NO_NUM.sub(replace_glyph_no_num, content)

    # ── Pass 5: remove any remaining standalone presentation-form glyph strings ──
    # Only remove sequences of 4+ consecutive pres-form chars not inside brackets
    prev = None
    while prev != content:
        prev = content
        content = re.sub(
            r'(?<![﴿﴾])\s*(?:' + PRES_GLYPH + r'[\u0600-\u06FF\u064B-\u065F\s]*){4,}',
            ' ',
            content,
        )

    # normalise multiple spaces
    content = re.sub(r'[ \t]{2,}', ' ', content)
    content = re.sub(r'\n{3,}', '\n\n', content)

    return content, restored, cleaned


def process_file(path: Path) -> tuple[int, int]:
    text = path.read_text(encoding='utf-8')
    new_text, r, c = restore_verses(text)
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
    return r, c


def main():
    files = sorted(CONTENT_DIR.glob('*.md'))
    total_r = total_c = 0
    for f in files:
        print(f"\n── {f.name} ──")
        r, c = process_file(f)
        total_r += r
        total_c += c
        if r or c:
            print(f"   → {r} verse(s) restored via API, {c} glyph blob(s) cleaned")
        else:
            print(f"   → no changes")
    print(f"\n{'='*50}")
    print(f"Done. Total: {total_r} verses restored, {total_c} glyph blobs cleaned.")


if __name__ == "__main__":
    main()
