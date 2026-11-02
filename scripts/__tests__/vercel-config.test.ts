import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync("vercel.json", "utf8"));

const bySource = Object.fromEntries(
  (config.headers ?? []).map((entry: { source: string; headers: unknown[] }) => [
    entry.source,
    entry.headers,
  ]),
);

describe("vercel.json", () => {
  it("never caches the service worker", () => {
    expect(bySource["/sw.js"]).toContainEqual({
      key: "Cache-Control",
      value: "no-cache, no-store, must-revalidate",
    });
    expect(bySource["/sw.js"]).toContainEqual({
      key: "Service-Worker-Allowed",
      value: "/",
    });
  });

  it("caches build assets and book images immutably", () => {
    expect(bySource["/_next/static/(.*)"]).toContainEqual({
      key: "Cache-Control",
      value: "public, max-age=31536000, immutable",
    });
    expect(bySource["/images/(.*)"]).toContainEqual({
      key: "Cache-Control",
      value: "public, max-age=31536000, immutable",
    });
  });

  it("revalidates the search index on every request", () => {
    expect(bySource["/search-data.json"]).toContainEqual({
      key: "Cache-Control",
      value: "public, max-age=0, must-revalidate",
    });
  });

  it("sends baseline security headers on every response", () => {
    const catchAll = bySource["/(.*)"];
    expect(catchAll).toContainEqual({ key: "X-Content-Type-Options", value: "nosniff" });
    expect(catchAll).toContainEqual({
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    });
    expect(catchAll).toContainEqual({ key: "X-Frame-Options", value: "DENY" });
    expect(catchAll).toContainEqual({
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    });
    expect(catchAll).toContainEqual({
      key: "Cross-Origin-Opener-Policy",
      value: "same-origin",
    });
  });

  it("keeps the Apache cache rule for the search index in sync", () => {
    const htaccess = readFileSync("public/.htaccess", "utf8");
    const block =
      htaccess.match(/<Files "search-data\.json">([\s\S]*?)<\/Files>/)?.[1] ?? "";

    expect(block).toContain("must-revalidate");
    expect(block).not.toContain("immutable");
  });
});
