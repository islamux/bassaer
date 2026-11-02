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
  await page.goto("/");
  const sw = await (await page.request.get("/sw.js")).text();
  expect(sw).toContain("offline.html");

  const res = await page.request.get("/offline.html");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("غير متصل");
});
