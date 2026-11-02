import { test, expect } from "@playwright/test";

test("search dialog opens and closes", async ({ page }) => {
  await page.goto("/");
  const searchBtn = page.getByRole("button", { name: "بحث في الكتاب" });
  await searchBtn.click();
  const dialog = page.getByRole("dialog", { name: "بحث في الكتاب" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("search returns results for valid query", async ({ page }) => {
  test.setTimeout(30000);
  await page.goto("/");
  await page.getByRole("button", { name: "بحث في الكتاب" }).click();
  const input = page.locator("input[placeholder='ابحث في الكتاب...']");
  await input.fill("الله");
  await page.waitForTimeout(1000);
  const results = page.locator("[role='dialog'] a");
  const count = await results.count();
  expect(count).toBeGreaterThan(0);
});

test("search keyboard shortcut Ctrl+K opens dialog", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "بحث في الكتاب" });
  await expect(dialog).toBeVisible();
});

test("does not download the search index until the dialog opens", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("search-data.json")) requests.push(r.url());
  });

  await page.goto("/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1000);
  expect(requests).toHaveLength(0);

  await page.getByRole("button", { name: "بحث في الكتاب" }).click();
  await expect.poll(() => requests.length).toBe(1);
});

test("matches a diacritized query", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "بحث في الكتاب" }).click();
  const input = page.locator("input[placeholder='ابحث في الكتاب...']");
  await input.fill("بَصَائِر");
  await expect(page.locator("[role='dialog'] a").first()).toBeVisible();
});
