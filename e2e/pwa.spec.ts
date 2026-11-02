import { test, expect } from "@playwright/test";

test("manifest.json is served correctly", async ({ page }) => {
  const response = await page.goto("/manifest.json");
  expect(response?.status()).toBe(200);
  const manifest = await response?.json();
  expect(manifest.name).toBeTruthy();
  expect(manifest.icons).toBeDefined();
  expect(manifest.icons.length).toBeGreaterThan(0);
});

test("service worker is registered", async ({ page }) => {
  await page.goto("/");
  const hasSW = await page.evaluate(() => "serviceWorker" in navigator);
  expect(hasSW).toBe(true);
});

test("ships an offline fallback document", async ({ page }) => {
  const res = await page.request.get("/offline.html");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("غير متصل");
});

test("serves the offline fallback for an uncached navigation", async ({ page, context }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null, undefined, {
    timeout: 30_000,
  });

  await context.setOffline(true);
  try {
    await page.goto("/__offline_probe__/");
  } finally {
    await context.setOffline(false);
  }

  await expect(
    page.getByRole("heading", { name: "أنت غير متصل بالإنترنت" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "العودة إلى الكتاب" })).toHaveAttribute(
    "href",
    "/",
  );
});
