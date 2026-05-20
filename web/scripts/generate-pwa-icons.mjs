import sharp from "sharp";
import fs from "fs";
import path from "path";

const sizes = [192, 512];
const outDir = path.resolve("public", "icons");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const size of sizes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#A0781E"/>
        <stop offset="100%" style="stop-color:#6B4F0F"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#bg)"/>
    <rect x="${size * 0.08}" y="${size * 0.08}" width="${size * 0.84}" height="${size * 0.84}" rx="${Math.round(size * 0.16)}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="${Math.max(1, Math.round(size * 0.02))}"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${Math.round(size * 0.55)}px" font-weight="bold" fill="white" letter-spacing="2">ب</text>
  </svg>`;

  const outPath = path.join(outDir, `icon-${size}x${size}.png`);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`Generated ${outPath}`);
}

console.log("PWA icons generated successfully!");
