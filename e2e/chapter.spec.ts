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
