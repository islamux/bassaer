#!/usr/bin/env node
import { readFileSync } from "fs";
import { JSDOM } from "jsdom";

const html = readFileSync("presentation/slides.html", "utf-8");
const dom = new JSDOM(html, { runScripts: "dangerously", pretendVisual: true });
const { document } = dom.window;

let pass = 0, fail = 0;
const assert = (label, ok) => {
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else    { fail++; console.error(`  ✗ ${label}`); }
};

console.log("\n— presentation/smoke-test.mjs —\n");

// 1. Structural basics
assert("html lang=ar", document.documentElement.getAttribute("lang") === "ar");
assert("html dir=rtl", document.documentElement.getAttribute("dir") === "rtl");

// 2. Slides exist and are numbered
const slides = document.querySelectorAll("[data-slide]");
const minSlides = parseInt(process.argv.includes("--min") ? process.argv[process.argv.indexOf("--min") + 1] : "30", 10);
assert(`slide count >= ${minSlides} (found ${slides.length})`, slides.length >= minSlides);

// 3. Dynamic numbering rendered (JS writes N/total into .slide-number elements)
const numberingEl = document.querySelector(".slide-number");
assert("slide-number element exists", !!numberingEl);
if (numberingEl) {
  assert("numbering contains '/' (N/total)", /\d+\s*\/\s*\d+/.test(numberingEl.textContent));
}

// 4. Navigation buttons with aria-labels
const buttons = document.querySelectorAll("button[aria-label]");
assert(`navigation buttons >= 5 (found ${buttons.length})`, buttons.length >= 5);

// 5. Notes container exists
assert("speaker notes container exists", !!document.querySelector("[data-notes]") || !!document.querySelector("aside"));

// 6. Index/overview exists
assert("overview panel exists", !!document.querySelector("#overview") || !!document.querySelector("[data-overview]"));

// 7. CSS contains key rules
assert("prefers-reduced-motion in CSS", html.includes("prefers-reduced-motion"));
assert("@media print in CSS", html.includes("@media print"));

// 8. No placeholder text left
assert("no TODO/placeholder text", !/TODO|TBD|placeholder|يجب ملء/i.test(html));

// 9. Keyboard nav JS exists
assert("keydown handler registered", html.includes("keydown") || html.includes("addEventListener"));

// 10. Touch support JS exists
assert("touch handler registered", html.includes("touchstart") || html.includes("touch"));

dom.window.close();
console.log(`\n  Results: ${pass} passed, ${fail} failed\n`);
process.exit(fail > 0 ? 1 : 0);
