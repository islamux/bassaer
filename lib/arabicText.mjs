const SPACE = " ";

function isWhitespace(code) {
  return (
    code === 0x20 ||
    (code >= 0x09 && code <= 0x0d) ||
    code === 0xa0 ||
    code === 0x1680 ||
    (code >= 0x2000 && code <= 0x200a) ||
    code === 0x2028 ||
    code === 0x2029 ||
    code === 0x202f ||
    code === 0x205f ||
    code === 0x3000 ||
    code === 0xfeff
  );
}

function isIgnored(code) {
  return (
    (code >= 0x0610 && code <= 0x061a) ||
    (code >= 0x064b && code <= 0x065f) ||
    code === 0x0670 ||
    (code >= 0x06d6 && code <= 0x06ed) ||
    code === 0x0640 ||
    code === 0x200e ||
    code === 0x200f ||
    (code >= 0x202a && code <= 0x202e)
  );
}

function normalizeCode(code) {
  if (code >= 0x0660 && code <= 0x0669) return code - 0x0660 + 0x30;
  if (code >= 0x06f0 && code <= 0x06f9) return code - 0x06f0 + 0x30;

  switch (code) {
    case 0x0623: // أ
    case 0x0625: // إ
    case 0x0622: // آ
    case 0x0671: // ٱ
      return 0x0627; // ا
    case 0x0649: // ى
      return 0x064a; // ي
    case 0x0629: // ة
      return 0x0647; // ه
    case 0x0624: // ؤ
      return 0x0648; // و
    case 0x0626: // ئ
      return 0x064a; // ي
    default:
      return code;
  }
}

/**
 * Single-pass normalizer. Optionally records, for every emitted character,
 * the index it came from in the raw string, so matches can be mapped back
 * to original offsets.
 *
 * @param {string} input
 * @param {number[] | null} indexes
 * @returns {string}
 */
function normalizeInto(input, indexes) {
  const out = [];

  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    if (isIgnored(code)) continue;

    if (isWhitespace(code)) {
      if (out.length === 0 || out[out.length - 1] === SPACE) continue;
      out.push(SPACE);
      if (indexes) indexes.push(i);
      continue;
    }

    out.push(String.fromCharCode(normalizeCode(code)));
    if (indexes) indexes.push(i);
  }

  if (out.length > 0 && out[out.length - 1] === SPACE) {
    out.pop();
    if (indexes) indexes.pop();
  }

  return out.join("");
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
  return normalizeInto(input, null);
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

  /** @type {number[]} */
  const rawIndexes = [];
  const normalized = normalizeInto(rawText, rawIndexes);

  const position = normalized.indexOf(needle);
  if (position === -1) return null;

  const start = rawIndexes[position];
  const end = rawIndexes[position + needle.length - 1] + 1;
  return { index: start, length: end - start };
}
