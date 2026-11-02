import { test, expect } from "@playwright/test";

test("chapter page shows title and content", async ({ page }) => {
  await page.goto("/chapter/intro");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("article")).toBeVisible();
});

test("chapter page has bookmark button", async ({ page }) => {
  await page.goto("/chapter/intro");
  const bookmarkBtn = page.getByRole("button", { name: /مفضلة|إزالة/i });
  await expect(bookmarkBtn).toBeVisible();
});

test("chapter page has prev/next navigation", async ({ page }) => {
  await page.goto("/chapter/chapter-1");
  const navLinks = page.locator("a[href^='/chapter/']");
  const count = await navLinks.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

test("navigates between chapters via next link", async ({ page }) => {
  await page.goto("/chapter/intro");
  const nextLink = page.locator("a").filter({ hasText: "التالي" });
  if (await nextLink.isVisible()) {
    await nextLink.click();
    await expect(page).not.toHaveURL("/chapter/intro");
  }
});

test("invalid chapter slug shows 404", async ({ page }) => {
  const response = await page.goto("/chapter/nonexistent-chapter");
  expect(response?.status()).toBe(404);
});

test("emits canonical, open graph and Chapter JSON-LD", async ({ page }) => {
  await page.goto("/chapter/intro/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/chapter\/intro\/$/);
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/icons\/icon-512x512\.png$/,
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "ar_AR");
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    "مقدمة الكتاب",
  );
  const jsonLd = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}",
  );
  expect(jsonLd["@type"]).toBe("Chapter");
  expect(jsonLd.isPartOf.name).toContain("بصائر");
});

test("emits site-level open graph and twitter metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "بصائر");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/$/);
});
