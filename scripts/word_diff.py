#!/usr/bin/env python3
"""Fast Word-to-Markdown textual diff for Arabic content."""

import re
import os
import sys
from docx import Document

WORD_PATH = "content/ar-basaar.docx"
CHAPTERS_DIR = "content/chapters"

# Chapter boundaries (paragraph index ranges in Word doc)
# Mapping: MD chapter -> (start_para, end_para) in the Word doc
CHAPTER_RANGES = {
    "chapter-1":   (22, 1294),
    "chapter-2":   (1319, 1705),
    "chapter-3":   (1705, 2858),
    "chapter-4":   (2858, 3189),
    "chapter-5":   (3189, 3458),
    "chapter-6":   (3458, 3674),
    "chapter-7":   (3686, 4239),
    "chapter-8":   (4239, 4567),
    "chapter-9":   (4567, 7372),
    "chapter-10":  (7372, 9856),
    "chapter-11":  (9856, 10196),
    "chapter-12":  (10074, 10196),
}


def load_word_paragraphs():
    doc = Document(WORD_PATH)
    return [(p.text.strip(), p.style.name if p.style else "Normal") for p in doc.paragraphs]


def read_markdown(chapter_id):
    path = os.path.join(CHAPTERS_DIR, f"{chapter_id}.md")
    if not os.path.exists(path):
        return [], ""
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    content = re.sub(r"^---\n.*?\n---\n", "", content, flags=re.DOTALL)
    lines = [l.strip() for l in content.split("\n") if l.strip()]
    return lines, content


def normalize(text):
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"[\[\](){}]", "", text)
    text = text.replace("ـ", "")
    text = text.replace("\\", "")
    return text


def extract_phrases(text, min_len=25):
    """Split text into overlapping phrases for matching."""
    words = text.split()
    phrases = []
    for i in range(0, len(words), 3):
        chunk = " ".join(words[i:i+15])
        if len(chunk) >= min_len:
            phrases.append(chunk)
    return phrases


def find_unmatched_phrases(word_phrases, md_text_normalized, threshold=0.4):
    """Find Word phrases that don't appear in MD text."""
    unmatched = []
    for phrase in word_phrases:
        if len(phrase) < 30:
            continue
        # Quick presence check
        search = phrase[:80]
        if search not in md_text_normalized:
            unmatched.append(phrase)
    return unmatched


def report_chapter(ch_id, word_texts, md_lines, md_text):
    word_joined = normalize(" ".join(word_texts))
    md_joined = normalize(" ".join(md_lines))

    # Word count comparison
    wc_word = len(word_joined.split())
    wc_md = len(md_joined.split())

    # Token overlap
    word_tokens = set(word_joined.split())
    md_tokens = set(md_joined.split())
    common = word_tokens & md_tokens
    overlap = len(common) / max(len(word_tokens), len(md_tokens)) * 100 if max(len(word_tokens), len(md_tokens)) > 0 else 0

    # Find missing phrases
    word_phrases = extract_phrases(word_joined)
    unmatched = find_unmatched_phrases(word_phrases, md_joined)

    lines = []
    lines.append(f"## {ch_id}")
    lines.append(f"- Word tokens: {wc_word}")
    lines.append(f"- MD tokens: {wc_md}")
    lines.append(f"- Token overlap: {overlap:.1f}%")
    lines.append(f"- Unmatched Word phrases: {len(unmatched)}")
    lines.append("")

    if unmatched:
        lines.append("### Potential textual discrepancies (Word has, MD may be missing/wrong):")
        lines.append("")
        for i, phrase in enumerate(unmatched[:40]):
            lines.append(f"{i+1}. **{phrase[:150]}**")
        if len(unmatched) > 40:
            lines.append(f"\n... and {len(unmatched) - 40} more.")
        lines.append("")

    return "\n".join(lines), len(unmatched), overlap


def main():
    paragraphs = load_word_paragraphs()
    os.makedirs("docs/word-diff-reports", exist_ok=True)

    all_reports = []
    all_reports.append("# Word-to-MD Textual Comparison Report")
    all_reports.append(f"Date: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')}")
    all_reports.append("---\n")

    results = []

    for ch_id in [f"chapter-{i}" for i in range(1, 13)]:
        if ch_id not in CHAPTER_RANGES:
            continue
        start, end = CHAPTER_RANGES[ch_id]
        word_texts = [t for t, s in paragraphs[start:end] if t]
        md_lines, md_content = read_markdown(ch_id)
        if not md_lines:
            print(f"Skipping {ch_id}: no markdown file")
            continue
        report, unmatched_count, overlap = report_chapter(ch_id, word_texts, md_lines, md_content)
        all_reports.append(report)
        all_reports.append("---\n")
        results.append((ch_id, overlap, unmatched_count))

    # Summary table
    all_reports.append("# Summary\n")
    all_reports.append("| Chapter | Token Overlap | Unmatched Phrases | Priority |")
    all_reports.append("|---------|:------------:|:------------------:|:--------:|")
    for ch_id, overlap, unmatched in sorted(results, key=lambda x: x[1]):
        priority = "HIGH" if overlap < 60 else "MEDIUM" if overlap < 80 else "LOW"
        all_reports.append(f"| {ch_id} | {overlap:.1f}% | {unmatched} | {priority} |")

    report_text = "\n".join(all_reports)
    with open("docs/word-diff-reports/full-report.md", "w", encoding="utf-8") as f:
        f.write(report_text)

    print(f"Report: docs/word-diff-reports/full-report.md\n")
    print("| Chapter | Overlap | Unmatched | Priority |")
    print("|---------|:-------:|:---------:|:--------:|")
    for ch_id, overlap, unmatched in sorted(results, key=lambda x: x[1]):
        priority = "HIGH" if overlap < 60 else "MEDIUM" if overlap < 80 else "LOW"
        print(f"| {ch_id} | {overlap:.1f}% | {unmatched} | {priority} |")


if __name__ == "__main__":
    main()
