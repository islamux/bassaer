#!/usr/bin/env python3
from pathlib import Path

SOURCE_FILE = Path('content/chapter-12.md')
OUTPUT_DIR = Path('content')

def realign():
    if not SOURCE_FILE.exists():
        print(f"Error: {SOURCE_FILE} not found.")
        return

    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find line indices (0-based) for the markers
    def find_line(pattern):
        for i, line in enumerate(lines):
            if pattern in line:
                return i
        return None

    # We use the previous extraction to find exact line matches
    # Chapter 6 start: line 1
    # Chapter 7 start: "# الباب السابع"
    # Chapter 8 start: "# الباب لا ثامن"
    # Chapter 9 start: "# الباب التاسع"
    # Chapter 10 start: "الباب العاشر"
    # Chapter 11 start: "الباب لا حاد في عشر"
    # Chapter 12 start: "## 161 - لماذا أنا مسلم؟"

    marks = [
        ("chapter-6", 0),
        ("chapter-7", find_line("# الباب السابع")),
        ("chapter-8", find_line("# الباب لا ثامن")),
        ("chapter-9", find_line("# الباب التاسع")),
        ("chapter-10", find_line("الباب العاشر")),
        ("chapter-11", find_line("الباب لا حاد في عشر")),
        ("chapter-12", find_line("## 161 - لماذا أنا مسلم؟")),
    ]

    # Filter out missing marks
    marks = [(name, idx) for name, idx in marks if idx is not None]
    marks.sort(key=lambda x: x[1])

    for i in range(len(marks)):
        name, start = marks[i]
        end = marks[i+1][1] if i+1 < len(marks) else len(lines)
        
        content = "".join(lines[start:end]).strip()
        output_file = OUTPUT_DIR / f"{name}.md"
        
        print(f"Writing {output_file} (Lines {start+1}-{end})")
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)

    print("\nRealignment complete.")

if __name__ == "__main__":
    realign()
