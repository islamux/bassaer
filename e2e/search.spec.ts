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
  const results = page
    .getByRole("dialog", { name: "بحث في الكتاب" })
    .getByRole("option");
  await expect(results.first()).toBeVisible();
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
  await expect(
    page.getByRole("dialog", { name: "بحث في الكتاب" }).getByRole("option").first(),
  ).toBeVisible();
});

test("escape closes the dialog even when the input is not focused", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await page.getByRole("dialog").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("locks body scroll while open and restores it on close", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("exposes combobox semantics and tracks the active option", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const input = page.getByRole("combobox");
  await input.fill("الله");
  await page.waitForTimeout(1000);
  await page.keyboard.press("ArrowDown");
  await expect(input).toHaveAttribute("aria-activedescendant", /search-result-0/);
});

test.describe("search index failure", () => {
  test.use({ serviceWorkers: "block" });

  test("shows an error and retries when the index fails to load", async ({ page }) => {
    await page.route("**/search-data.json", (route) => route.abort());
    await page.goto("/");
    await page.getByRole("button", { name: "بحث في الكتاب" }).click();
    await expect(page.getByText("تعذر تحميل فهرس البحث")).toBeVisible();

    await page.unroute("**/search-data.json");
    await page.getByRole("button", { name: "إعادة المحاولة" }).click();
    await page.getByRole("combobox").fill("الله");
    await expect(page.getByRole("option").first()).toBeVisible();
  });
});
