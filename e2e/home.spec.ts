import { test, expect } from "@playwright/test";

test("homepage renders book title and chapter grid", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("بصائر في الكون والحياة والدين");
  const chapterLinks = page.locator("a[href^='/chapter/']");
  const count = await chapterLinks.count();
  expect(count).toBeGreaterThan(0);
});

test("homepage has start reading button", async ({ page }) => {
  await page.goto("/");
  const startButton = page.getByRole("link", { name: "ابدأ القراءة" });
  await expect(startButton).toBeVisible();
});

test("homepage chapter cards link to correct chapters", async ({ page }) => {
  await page.goto("/");
  const firstChapterLink = page.locator("a[href^='/chapter/']").first();
  await expect(firstChapterLink).toBeVisible();
  await firstChapterLink.click();
  await expect(page).toHaveURL(/\/chapter\//);
});
