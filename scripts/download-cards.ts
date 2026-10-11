import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { CARD_IMAGE_FILENAME_MAP } from "../lib/tarot/card-images";

const RAW_GITHUB_BASE =
  "https://raw.githubusercontent.com/mixvlad/TarotCards/main/tarot/rider-waite/full-png";

const TARGET_DIR = path.resolve(process.cwd(), "public/cards");

async function downloadAndOptimize(filename: string): Promise<void> {
  const sourceUrl = `${RAW_GITHUB_BASE}/${filename}`;
  const baseName = path.parse(filename).name;
  const targetPath = path.join(TARGET_DIR, `${baseName}.webp`);

  if (fs.existsSync(targetPath)) {
    return;
  }

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sourceUrl}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Resize to max width 400px (standard mobile/desktop card size), convert to WebP (30-40 KB)
  await sharp(buffer)
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toFile(targetPath);
}

async function main() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const uniqueFilenames = Array.from(
    new Set([...Object.values(CARD_IMAGE_FILENAME_MAP), "Cover.png"])
  );

  console.log(`Starting download & optimization of ${uniqueFilenames.length} card images...`);

  // Process in batches of 5 concurrent downloads to be gentle with network
  const batchSize = 6;
  for (let i = 0; i < uniqueFilenames.length; i += batchSize) {
    const batch = uniqueFilenames.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (filename) => {
        try {
          await downloadAndOptimize(filename);
          process.stdout.write(`✓ ${filename} `);
        } catch (err) {
          console.error(`\n✗ Error processing ${filename}:`, err);
        }
      })
    );
  }

  console.log("\nFinished downloading and converting all 78 card images + Cover to WebP!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
