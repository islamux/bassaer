import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "serwist";
import { Serwist } from "serwist";

const serwist = new Serwist({
  precacheEntries: (self as unknown as { __SW_MANIFEST: PrecacheEntry[] }).__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
