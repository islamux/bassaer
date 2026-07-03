import { test, expect } from "@playwright/test";

test("placeholder: playwright is configured", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
});
