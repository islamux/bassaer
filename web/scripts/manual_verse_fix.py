import os

FIXES = [
    {
        "file": "content/chapter-4.md",
        "old": "تنتىتيثرثز ثم ﴿ سورة النساء",
        "new": "﴿ أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ ۚ وَلَوْ كَانَ مِنْ عِنْدِ غَيْرِ اللَّهِ لَوَجَدُوا فِيهِ اخْتِلَافًا كَثِيرًا ﴾ ﴿ سورة النساء 82 ﴾"
    },
    {
        "file": "content/chapter-4.md",
        "old": "اقرأوانظر واحكم بنفسك. .. ﴿ سورة. سبأ",
        "new": "اقرأ وانظر واحكم بنفسك.. . ﴿ قُلْ إِنَّمَا أَعِظُكُم بِوَاحِدَةٍ ۖ أَن تَقُومُوا لِلَّهِ مَثْنَىٰ وَفُرَادَىٰ ثُمَّ تَتَفَكَّرُوا ۚ مَا بِصَاحِبِكُم مِّن جِنَّةٍ ۚ إِنْ هُوَ إِلَّا نَذِيرٌ لَّكُم بَيْنَ يَدَيْ عَذَابٍ شَدِيدٍ ﴾ ﴿ سورة سبأ 46 ﴾"
    },
    {
        "file": "content/chapter-4.md",
        "old": "ولا من خلفه، وهذا مُ حال لو كان قول بشر: ﴿ سورة فصلت",
        "new": "ولا من خلفه، وهذا مُ حال لو كان قول بشر: ﴿ لَّا يَأْتِيهِ الْبَاطِلُ مِن بَيْنِ يَدَيْهِ وَلَا مِنْ خَلْفِهِ ۖ تَنزِيلٌ مِّنْ حَكِيمٍ حَمِيدٍ ﴾ ﴿ سورة فصلت 42 ﴾"
    },
    {
        "file": "content/chapter-6.md",
        "old": "فالدواب وعليها يضعون أثقالهمي السفر م نج. . ﴿ سورة النحل",
        "new": "فالدواب وعليها يضعون أثقالهم في السفر ﴿ وَالْخَيْلَ وَالْبِغَالَ وَالْحَمِيرَ لِتَرْكَبُوهَا وَزِينَةً ۚ وَيَخْلُقُ مَا لَا تَعْلَمُونَ ﴾ ﴿ سورة النحل 8 ﴾"
    },
    {
        "file": "content/chapter-7.md",
        "old": "تنتىتيثرثز ثم ﴿ سورة. النساء",
        "new": "﴿ أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ ۚ وَلَوْ كَانَ مِنْ عِنْدِ غَيْرِ اللَّهِ لَوَجَدُوا فِيهِ اخْتِلَافًا كَثِيرًا ﴾ ﴿ سورة النساء 82 ﴾"
    },
    {
        "file": "content/chapter-7.md",
        "old": "ولا من خلفه ﴿ سورة فصلت",
        "new": "ولا من خلفه ﴿ لَّا يَأْتِيهِ الْبَاطِلُ مِن بَيْنِ يَدَيْهِ وَلَا مِنْ خَلْفِهِ ۖ تَنزِيلٌ مِّنْ حَكِيمٍ حَمِيدٍ ﴾ ﴿ سورة فصلت 42 ﴾"
    }
]

def apply_fixes():
    for fix in FIXES:
        file_path = fix["file"]
        if not os.path.exists(file_path): continue
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Try to find the old string even if slightly different due to cleanup
        if fix["old"] in content:
            new_content = content.replace(fix["old"], fix["new"])
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Applied fix to {file_path}")
        else:
            # Try fuzzy match if exact match fails
            print(f"Match not found for fix in {file_path}: {fix['old'][:30]}...")

if __name__ == "__main__":
    apply_fixes()
