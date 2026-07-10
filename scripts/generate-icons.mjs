// Generates the app's PWA icons from a single inline SVG source. Run with:
//   node scripts/generate-icons.mjs
//
// Motif: a rounded square split left/right into two shades of blue — the same
// "division of a shared cost between two people" idea as the iOS app's placeholder
// AppIcon (see ../../simple-warikan/CLAUDE.md, "アプリアイコン" section), redrawn from
// scratch for the web build rather than reusing any asset from that (read-only) repo.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

function iconSvg(size) {
  const r = size * 0.22;
  const mid = size / 2;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <clipPath id="rounded">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}" />
    </clipPath>
  </defs>
  <g clip-path="url(#rounded)">
    <rect x="0" y="0" width="${mid}" height="${size}" fill="#3478f6" />
    <rect x="${mid}" y="0" width="${mid}" height="${size}" fill="#8bb6ff" />
    <rect x="${mid - size * 0.012}" y="0" width="${size * 0.024}" height="${size}" fill="#ffffff" opacity="0.85" />
    <text
      x="${mid}"
      y="${size * 0.66}"
      text-anchor="middle"
      font-family="-apple-system, 'Hiragino Sans', Arial, sans-serif"
      font-size="${size * 0.46}"
      font-weight="700"
      fill="#ffffff"
    >¥</text>
  </g>
</svg>`.trim();
}

async function main() {
  await mkdir(publicDir, { recursive: true });

  // Standalone favicon (kept simple / crisp at tiny sizes).
  await writeFile(path.join(publicDir, "favicon.svg"), iconSvg(64));

  for (const size of [192, 512]) {
    const svg = Buffer.from(iconSvg(size));
    await sharp(svg).png().toFile(path.join(publicDir, `icon-${size}.png`));
  }

  console.log("Generated favicon.svg, icon-192.png, icon-512.png in public/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
