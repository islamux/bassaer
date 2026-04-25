import os
import re
import json

CONTENT_DIR = "content"
FILES = [f for f in os.listdir(CONTENT_DIR) if f.endswith(".md")]

# Patterns to look for
REPLACEMENT_CHAR = "\uFFFD"
BROKEN_YA_PATTERN = r"(\b\w+) في\b"  # Matches words ending with 'في' which might be 'ي' (e.g., الذ في)
PRESENTATION_FORMS = r"[\uFB50-\uFDFF\uFE70-\uFEFF]"
BROKEN_SPACING = r"[\u0600-\u06FF][.،][\u0600-\u06FF]" # Punctuation stuck between Arabic letters

def audit_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.splitlines()

    issues = []
    
    # 1. Check for replacement characters
    if REPLACEMENT_CHAR in content:
        count = content.count(REPLACEMENT_CHAR)
        issues.append({"type": "replacement_char", "count": count, "desc": "Found Unicode replacement character ()"})

    # 2. Check for broken 'Ya' (Common PDF error where 'ي' becomes ' في')
    # We check for 'في' preceded by a space and a word that usually ends in 'ي'
    # Examples: الذي -> الذ في, في -> ف في, علي -> عل في
    broken_ya_matches = re.findall(r"\b\w+ في\b", content)
    if broken_ya_matches:
        # Filter for common false positives like 'نظرت في' vs 'الذ في'
        # Actually, in most cases in this book, 'في' after a word fragment is an error.
        errors = [m for m in broken_ya_matches if any(m.startswith(x) for x in ["الذ", "عل", "ف", "ف في", "يعن", "ه في"])]
        if errors:
            issues.append({"type": "broken_ya", "count": len(errors), "sample": errors[:5], "desc": "Potential broken 'Ya' (e.g., الذ في)"})

    # 3. Presentation Forms
    pres_forms = re.findall(PRESENTATION_FORMS, content)
    if pres_forms:
        issues.append({"type": "presentation_forms", "count": len(pres_forms), "desc": "Found Arabic presentation forms (often used in Quranic fonts but break search)"})

    # 4. Spacing issues
    spacing_issues = re.findall(BROKEN_SPACING, content)
    if spacing_issues:
        issues.append({"type": "spacing", "count": len(spacing_issues), "sample": spacing_issues[:5], "desc": "Missing spaces after punctuation"})

    # 5. Check for 'ضرورة' instead of 'عنه'/'عنها' (Radiya Allahu 'anhu/anha)
    # Line 10 in chapter-12: "رض في الله عائشة ضرورة:عنها"
    # This looks like "عنها" was misidentified or "عنه" became "ضرورة"
    if "ضرورة" in content:
        count = content.count("ضرورة")
        issues.append({"type": "radiya_error", "count": count, "desc": "Found 'ضرورة' which might be misidentified 'عنه/عنها'"})

    return issues

def main():
    report = {}
    for filename in sorted(FILES):
        file_path = os.path.join(CONTENT_DIR, filename)
        issues = audit_file(file_path)
        if issues:
            report[filename] = issues
            print(f"File: {filename} - {len(issues)} types of issues found.")
            for issue in issues:
                print(f"  - {issue['desc']} (Count: {issue['count']})")
        else:
            print(f"File: {filename} - OK")

    with open("audit_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
