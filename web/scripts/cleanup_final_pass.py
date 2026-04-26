#!/usr/bin/env python3
"""
cleanup_final_pass.py
=====================
Final targeted fixes for the remaining edge-case patterns after
quran_restoration_v2.py and cleanup_inline_noise.py have run.

Specific patterns handled:
  1. ﴾ N ﴿ سورة NAME.  or  ﴾ N ﴿ سورة آل. عمران  (dot inside name)
  2. Mixed digit formats like "8٣" or "14٥" or "1٥٩" → normalise to western
  3. Missing surah name after سورة + dot (e.g. "سورة. النبأ" → "سورة النبأ")
  4. "سورة آل. عمران" → "سورة آل عمران"
  5. Orphaned ﴾/﴿ pair with number but surah name is on next line
"""

import re
from pathlib import Path

CONTENT_DIR = Path(__file__).parent.parent / "content"

AR_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")

SURAH_NAMES = [
    "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف",
    "الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر",
    "النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون",
    "النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
    "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر",
    "غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد",
    "الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن",
    "الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة",
    "المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة",
    "المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان",
    "المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين",
    "الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
    "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة",
    "الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل",
    "قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص",
    "الفلق","الناس",
]
_NAMES = "|".join(sorted(SURAH_NAMES, key=len, reverse=True))


def normalise_num(s: str) -> int:
    """Convert mixed Arabic-Indic + western digit string to int, e.g. '8٣'→83."""
    # Replace Arabic-Indic digits (U+0660-0669) with western for number parsing
    clean = s.translate(AR_DIGITS)
    # Also handle mixed digits like "8٣": each char is now western
    return int(clean)


def process(text: str) -> tuple[str, int]:
    n = 0

    # ── 1. "سورة آل. عمران" → "سورة آل عمران" (dot inside compound name) ──
    if "آل. عمران" in text:
        text = text.replace("آل. عمران", "آل عمران")
        n += 1

    # ── 2. "سورة. NAME" → "سورة NAME" ──
    def fix_dot_name(m):
        nonlocal n; n += 1
        return f"سورة {m.group(1)}"
    text = re.sub(r'سورة\s*\.\s*(' + _NAMES + r')', fix_dot_name, text)

    # ── 3. Normalise mixed-numeral verse markers ﴾ N ﴿ or [سورة X: N] ──
    # e.g. "8٣" → "83", "14٥" → "145", "1٥٩" → "159"
    def fix_mixed_num(m):
        nonlocal n
        try:
            val = normalise_num(m.group(0))
            result = str(val)
            if result != m.group(0):
                n += 1
                return result
        except:
            pass
        return m.group(0)

    # Match sequences of mixed western+Arabic-Indic digits
    text = re.sub(r'[\d٠-٩]{2,}', fix_mixed_num, text)

    # ── 4. ﴾ N ﴿ سورة NAME (without bracket normalisation) → [سورة NAME: N] ──
    def bracket_to_standard(m):
        nonlocal n; n += 1
        num = m.group(1)
        name = m.group(2).strip()
        try:
            num_int = normalise_num(num)
        except:
            num_int = num
        return f"[سورة {name}: {num_int}]"

    text = re.sub(
        r'(?:﴾|﴿)\s*([\d٠-٩]{1,3})\s*(?:﴾|﴿)\s*سورة\s+(' + _NAMES + r')',
        bracket_to_standard,
        text,
    )

    # ── 5. Clean up "سورة.\n" broken across a newline where name follows ──
    # e.g.: "سورة.\n الإسراء" → "سورة الإسراء"
    text = re.sub(
        r'سورة\s*\.\s*\n+\s*(' + _NAMES + r')',
        lambda m: (setattr(lambda: None, '_', n := n+1) or f"سورة {m.group(1)}"),  # trick
        text,
    )
    # simpler version without trick:
    def fix_newline_surah(m):
        nonlocal n; n += 1
        return f"سورة {m.group(1)}"
    text = re.sub(r'سورة\s*\.\s*\n+\s*(' + _NAMES + r')', fix_newline_surah, text)

    # ── 6. Fix trailing dot after verse citation "[سورة X: N]." → "[سورة X: N]" ──
    # only if it's not end of sentence
    # leave as is – dots are ambiguous

    # ── 7. Normalise extra spaces ──
    text = re.sub(r'[ \t]{2,}', ' ', text)

    return text, n


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
