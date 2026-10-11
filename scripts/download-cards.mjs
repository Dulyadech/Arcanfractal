import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RAW_GITHUB_BASE =
  "https://raw.githubusercontent.com/mixvlad/TarotCards/main/tarot/rider-waite/full-png";

const TARGET_DIR = path.resolve(process.cwd(), "public/cards");

// The complete list of 78 Rider-Waite cards + Cover
const ALL_FILENAMES = [
  // Major Arcana (0-21)
  "00_Fool.png",
  "01_Magician.png",
  "02_High_Priestess.png",
  "03_Empress.png",
  "04_Emperor.png",
  "05_Hierophant.png",
  "06_Lovers.png",
  "07_Chariot.png",
  "08_Strength.png",
  "09_Hermit.png",
  "10_Wheel_of_Fortune.png",
  "11_Justice.png",
  "12_Hanged_Man.png",
  "13_Death.png",
  "14_Temperance.png",
  "15_Devil.png",
  "16_Tower.png",
  "17_Star.png",
  "18_Moon.png",
  "19_Sun.png",
  "20_Judgement.png",
  "21_World.png",

  // Wands (1-14)
  "Wands01.png",
  "Wands02.png",
  "Wands03.png",
  "Wands04.png",
  "Wands05.png",
  "Wands06.png",
  "Wands07.png",
  "Wands08.png",
  "Wands09.png",
  "Wands10.png",
  "Wands11.png",
  "Wands12.png",
  "Wands13.png",
  "Wands14.png",

  // Cups (1-14)
  "Cups01.png",
  "Cups02.png",
  "Cups03.png",
  "Cups04.png",
  "Cups05.png",
  "Cups06.png",
  "Cups07.png",
  "Cups08.png",
  "Cups09.png",
  "Cups10.png",
  "Cups11.png",
  "Cups12.png",
  "Cups13.png",
  "Cups14.png",

  // Swords (1-14)
  "Swords01.png",
  "Swords02.png",
  "Swords03.png",
  "Swords04.png",
  "Swords05.png",
  "Swords06.png",
  "Swords07.png",
  "Swords08.png",
  "Swords09.png",
  "Swords10.png",
  "Swords11.png",
  "Swords12.png",
  "Swords13.png",
  "Swords14.png",

  // Pentacles (1-14)
  "Pents01.png",
  "Pents02.png",
  "Pents03.png",
  "Pents04.png",
  "Pents05.png",
  "Pents06.png",
  "Pents07.png",
  "Pents08.png",
  "Pents09.png",
  "Pents10.png",
  "Pents11.png",
  "Pents12.png",
  "Pents13.png",
  "Pents14.png",

  // Card back
  "Cover.png",
];

async function downloadAndOptimize(filename) {
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

  // Resize width to 400px and convert to WebP (~30-40 KB)
  await sharp(buffer)
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toFile(targetPath);
}

async function main() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  console.log(`Starting download & optimization of ${ALL_FILENAMES.length} card images...`);

  const batchSize = 6;
  for (let i = 0; i < ALL_FILENAMES.length; i += batchSize) {
    const batch = ALL_FILENAMES.slice(i, i + batchSize);
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
