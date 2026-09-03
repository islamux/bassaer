# Presentation Package — Basaar

A presentation package for the Basaar digital book project: a 33-slide technical presentation in two decks (Arabic RTL and English LTR), training script, Q&A guide, and structural smoke-test tool.

---

## How to Run

1. Open `presentation/slides.html` (Arabic RTL) or `presentation/slides-en.html` (English LTR) directly in a browser.
2. Use the `n` or `N` keys to show/hide speaker notes.
3. Press `g` or `G` or `i` or `I` to show/hide the slide overview.
4. Press `f` or `F` to toggle fullscreen mode.

> No local server needed — the presentation is static and works by opening the file directly in the browser.

---

## Keyboard Shortcuts

> Arrow-key direction follows the deck's reading direction. **`slides.html`** is Arabic RTL (`ArrowLeft` = next, `ArrowRight` = previous). **`slides-en.html`** is English LTR (`ArrowRight` = next, `ArrowLeft` = previous).

| Key | Function |
|---|---|
| `ArrowLeft` / `ArrowRight` | Next/previous (direction depends on deck RTL/LTR, see above) |
| `Space` / `PageDown` | Next slide |
| `PageUp` | Previous slide |
| `Home` | First slide |
| `End` | Last slide |
| `f` / `F` | Toggle fullscreen |
| `n` / `N` | Toggle speaker notes |
| `g` / `G` / `i` / `I` | Toggle overview |
| `Escape` | Close overview |

> Touch swipe follows the deck's reading direction (RTL for the Arabic deck, LTR for the English deck).

---

## Files

| File | Function |
|---|---|
| `slides.html` | Arabic RTL deck — 33 slides |
| `slides-en.html` | English LTR deck — 33 slides |
| `demo-script.md` | Training script before the demo (Arabic) |
| `demo-script-en.md` | Training script before the demo (English) |
| `qa-guide.md` | Q&A guide (Arabic) |
| `qa-guide-en.md` | Q&A guide (English) |
| `README.md` | Package README (Arabic) |
| `README-en.md` | Package README (English) |
| `smoke-test.mjs` | Structural smoke-test tool (validates both decks) |

---

## Verify Presentation Structure

```bash
node presentation/smoke-test.mjs --min 33                                      # Arabic RTL deck (default)
node presentation/smoke-test.mjs --file presentation/slides-en.html --lang en --dir ltr --min 33   # English LTR deck
```

The test checks 13 conditions on each deck's structure. Expected result for both: 33 slides, 13/13 tests passing.

---

## Environment Requirements

- **Internet:** Required to load Google Fonts used in the presentation.
- **jsdom:** Required to run `smoke-test.mjs` (included in `devDependencies`).
- **PWA/Offline demo:** Requires a production build: `pnpm build && pnpm start` (Service Worker is disabled in development mode).

---

## Pre-Demo Rehearsal Checklist

- [ ] Full run-through with timing, matching the 60-minute budget
- [ ] Slide count (33) matches numbering
- [ ] `pnpm test` → 22 passed
- [ ] `pnpm test:static` → passes (lint + typecheck)
- [ ] `pnpm build` → passes (typecheck first, sequential)
- [ ] Smoke test → 13/13
- [ ] Fallback demo plan tested
- [ ] Keyboard navigation, fullscreen, notes, overview, touch
- [ ] Print/PDF export verified
- [ ] Projector test (RTL works, no overflow)
- [ ] Backup images prepared
- [ ] Demo commands documented
