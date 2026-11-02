export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://bassaer.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "بصائر";
export const BOOK_TITLE = "بصائر في الكون والحياة والدين";
export const BOOK_AUTHOR = "د. هيثم طلعت";
export const SITE_DESCRIPTION = "المكتبة الرقمية لكتاب بصائر في الكون والحياة والدين";

export function chapterUrl(slug: string): string {
  return `${SITE_URL}/chapter/${slug}/`;
}
