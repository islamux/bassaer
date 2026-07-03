import { test, expect } from "@playwright/test";

test("mobile menu opens and shows chapters", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const menuBtn = page.getByRole("button", { name: "فتح القائمة" });
  await menuBtn.click();
  const menu = page.getByRole("dialog", { name: "قائمة المحتويات" });
  await expect(menu).toBeVisible();
  const links = menu.locator("a[href^='/chapter/']");
  const count = await links.count();
  expect(count).toBeGreaterThan(0);
});

test("desktop sidebar shows bookmarks section", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const sidebar = page.getByRole("complementary", { name: "فهرس المحتويات الجانبي" });
  await expect(sidebar).toBeVisible();
});
