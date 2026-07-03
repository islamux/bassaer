import { test, expect } from "@playwright/test";

test("theme toggle switches between dark and light", async ({ page }) => {
  await page.goto("/");
  const themeBtn = page.getByRole("button", { name: /الوضع/ });
  await expect(themeBtn).toBeVisible();
  const initialClass = await page.locator("html").getAttribute("class");
  await themeBtn.click();
  await page.waitForTimeout(100);
  const newClass = await page.locator("html").getAttribute("class");
  expect(newClass).not.toBe(initialClass);
});
