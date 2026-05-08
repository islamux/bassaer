# Senior AI Prompt — Compare OCR-Based Next.js Project With Real UI Source (Word Version)

You are a senior software architect, UI auditor, OCR recovery specialist, and Next.js engineer.

## Context

I have a Next.js project that was originally built from OCR-extracted content taken from PDF files.

I already spent a very long time manually fixing OCR issues and estimate that around 90% of the OCR problems were corrected.

Now I found the original Microsoft Word version of the source content.

Your mission is to deeply analyze and compare:

1. The current Next.js project
2. The original Word source files
3. The actual rendered UI of the project

Then identify:

* Remaining OCR mistakes
* Structural mismatches
* Missing content
* Wrong Arabic text
* Broken formatting
* Layout inconsistencies
* Semantic issues
* UI rendering problems
* Incorrect RTL handling
* Typography problems
* Data hierarchy mismatches
* Component-level content corruption

---

# Primary Goal

Treat the Word files as the ground truth.

Use them to verify whether the current project UI accurately represents the original source.

The focus is NOT only text comparison.

The focus is:

* visual correctness
* semantic correctness
* structural correctness
* rendering quality
* Arabic typography correctness
* production-level UI fidelity

---

# Instructions

## Phase 1 — Project Understanding

First:

* Read the entire Next.js project structure
* Understand:

  * routing
  * app structure
  * data flow
  * content pipeline
  * UI architecture
  * typography system
  * RTL implementation
  * styling system
  * reusable components
  * markdown/json/content sources
  * OCR correction patterns already used

Then create:

* a mental model of the application
* content rendering flow
* source-to-UI mapping

Do NOT start modifying immediately.

---

## Phase 2 — Source Analysis

Read the Word source files carefully.

Extract and understand:

* headings hierarchy
* paragraphs
* lists
* tables
* quotations
* Quran/Hadith formatting if present
* Arabic punctuation
* spacing rules
* emphasis formatting
* footnotes
* page structure
* semantic grouping

Detect:

* canonical wording
* repeated phrases
* typography patterns
* formatting conventions

Treat Word as the authoritative source.

---

## Phase 3 — Deep Comparison

Now compare:

Word Source
VS
Current Rendered Next.js UI

At multiple levels:

### A — Textual Accuracy

Detect:

* OCR mistakes
* missing letters
* wrong Arabic characters
* duplicated words
* broken ligatures
* corrupted Unicode
* misplaced tashkeel
* punctuation mistakes
* spacing corruption
* line merge/split issues
* paragraph corruption

### B — Semantic Accuracy

Detect:

* wrong heading levels
* misplaced paragraphs
* incorrect ordering
* missing sections
* content attached to wrong components
* incorrect grouping

### C — UI Fidelity

Compare:

* typography
* font sizes
* line height
* spacing
* RTL alignment
* responsive behavior
* margins/padding
* visual hierarchy
* readability
* accessibility

### D — Component Integrity

Verify:

* tables render correctly
* quotes render correctly
* code blocks if present
* cards/layout sections
* tabs/accordions
* dynamic rendering logic

### E — Arabic Quality Audit

Pay extreme attention to:

* RTL correctness
* Arabic punctuation
* Arabic numerals
* Kashida issues
* ligatures
* font rendering
* mixed Arabic/English layout bugs
* bidi issues

---

# Required Output Format

Generate a detailed audit report with:

## 1. Executive Summary

* overall project quality
* estimated remaining OCR issue percentage
* UI quality score
* content fidelity score

## 2. OCR Issues Report

For every issue include:

* file path
* component/page
* original text
* incorrect text
* corrected version
* issue severity

## 3. Structural Issues

List:

* wrong hierarchy
* misplaced sections
* missing content
* ordering problems

## 4. UI/UX Issues

List:

* typography issues
* RTL problems
* spacing inconsistencies
* responsiveness issues
* readability concerns

## 5. Suggested Refactors

Recommend:

* component improvements
* content pipeline cleanup
* normalization strategies
* typography improvements
* rendering improvements
* Arabic text processing improvements

## 6. Automation Opportunities

Suggest scripts/tools to:

* automate OCR validation
* diff Word vs content
* normalize Arabic text
* detect Unicode corruption
* create regression checks

---

# Important Rules

* Never assume OCR text is correct.
* Always trust the Word source over project content.
* Prioritize Arabic correctness heavily.
* Think like a production auditor.
* Think like a QA engineer.
* Think like a typography specialist.
* Think like a senior frontend architect.

Do NOT make shallow comparisons.

Perform deep semantic and visual auditing.

Focus heavily on:

* edge cases
* hidden corruption
* rendering fidelity
* long-term maintainability

---

# Technical Expectations

The project uses:

* Next.js
* TypeScript
* TailwindCSS
* RTL Arabic UI
* OCR-derived content

You are expected to:

* inspect actual rendering logic
* inspect reusable components
* inspect hydration/rendering issues
* inspect typography configuration
* inspect font loading strategy
* inspect content normalization

---

# Final Deliverables

Produce:

1. Full audit report
2. Prioritized fix list
3. Suggested automated validation workflow
4. Suggested architecture improvements
5. Suggested scripts/tools
6. Confidence estimation for content accuracy
7. Remaining OCR risk assessment

The analysis must be exhaustive and production-grade.

