const TASHKEEL_AND_MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u200E\u200F\u202A-\u202E]/g;
const ALEF_VARIANTS = /[أإآٱ]/g;
const ALEF_MAQSURA = /ى/g;
const TA_MARBUTA = /ة/g;
const WAW_HAMZA = /ؤ/g;
const YA_HAMZA = /ئ/g;
const ARABIC_INDIC_DIGITS = /[٠-٩]/g;
const PERSIAN_DIGITS = /[۰-۹]/g;

function normalizeCore(input) {
  return input
    .replace(TASHKEEL_AND_MARKS, "")
    .replace(ALEF_VARIANTS, "ا")
    .replace(ALEF_MAQSURA, "ي")
    .replace(TA_MARBUTA, "ه")
    .replace(WAW_HAMZA, "و")
    .replace(YA_HAMZA, "ي")
    .replace(ARABIC_INDIC_DIGITS, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(PERSIAN_DIGITS, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}

/**
 * Normalizes Arabic text for search: strips diacritics/tatweel, unifies
 * alef/ya/ta-marbuta/hamza forms, converts Arabic-Indic digits, and
 * collapses whitespace.
 *
 * @param {string} input
 * @returns {string}
 */
export function normalizeArabic(input) {
  return normalizeCore(input).replace(/\s+/g, " ").trim();
}

/**
 * Finds `query` in `rawText` using normalized comparison while returning
 * offsets that point into the original string.
 *
 * @param {string} rawText
 * @param {string} query
 * @returns {{ index: number, length: number } | null}
 */
export function findNormalizedMatch(rawText, query) {
  const needle = normalizeArabic(query);
  if (!needle) return null;

  let normalized = "";
  /** @type {number[]} */
  const rawIndexes = [];

  for (let i = 0; i < rawText.length; i += 1) {
    const char = normalizeCore(rawText[i]);
    if (!char) continue;

    if (/\s/.test(char) && normalized.endsWith(" ")) continue;

    normalized += char;
    rawIndexes.push(i);
  }

  while (normalized.startsWith(" ")) {
    normalized = normalized.slice(1);
    rawIndexes.shift();
  }
  while (normalized.endsWith(" ")) {
    normalized = normalized.slice(0, -1);
    rawIndexes.pop();
  }

  const position = normalized.indexOf(needle);
  if (position === -1) return null;

  const start = rawIndexes[position];
  const end = rawIndexes[position + needle.length - 1] + 1;
  return { index: start, length: end - start };
}
