/**
 * Rider-Waite Tarot card image mapping (SDD §7.1, Phase 5).
 * Source: https://github.com/mixvlad/TarotCards/tree/main/tarot/rider-waite/full-png
 */

const RAW_GITHUB_BASE =
  "https://raw.githubusercontent.com/mixvlad/TarotCards/main/tarot/rider-waite/full-png";

export const CARD_IMAGE_FILENAME_MAP: Record<string, string> = {
  // Major Arcana (0-21)
  fool: "00_Fool.png",
  magician: "01_Magician.png",
  "high-priestess": "02_High_Priestess.png",
  empress: "03_Empress.png",
  emperor: "04_Emperor.png",
  hierophant: "05_Hierophant.png",
  lovers: "06_Lovers.png",
  chariot: "07_Chariot.png",
  strength: "08_Strength.png",
  hermit: "09_Hermit.png",
  "wheel-of-fortune": "10_Wheel_of_Fortune.png",
  justice: "11_Justice.png",
  "hanged-man": "12_Hanged_Man.png",
  death: "13_Death.png",
  temperance: "14_Temperance.png",
  devil: "15_Devil.png",
  tower: "16_Tower.png",
  star: "17_Star.png",
  moon: "18_Moon.png",
  sun: "19_Sun.png",
  judgement: "20_Judgement.png",
  world: "21_World.png",

  // Wands (1-14)
  "wands-01": "Wands01.png",
  "wands-02": "Wands02.png",
  "wands-03": "Wands03.png",
  "wands-04": "Wands04.png",
  "wands-05": "Wands05.png",
  "wands-06": "Wands06.png",
  "wands-07": "Wands07.png",
  "wands-08": "Wands08.png",
  "wands-09": "Wands09.png",
  "wands-10": "Wands10.png",
  "wands-page": "Wands11.png",
  "wands-knight": "Wands12.png",
  "wands-queen": "Wands13.png",
  "wands-king": "Wands14.png",
  "wands-11": "Wands11.png",
  "wands-12": "Wands12.png",
  "wands-13": "Wands13.png",
  "wands-14": "Wands14.png",

  // Cups (1-14)
  "cups-01": "Cups01.png",
  "cups-02": "Cups02.png",
  "cups-03": "Cups03.png",
  "cups-04": "Cups04.png",
  "cups-05": "Cups05.png",
  "cups-06": "Cups06.png",
  "cups-07": "Cups07.png",
  "cups-08": "Cups08.png",
  "cups-09": "Cups09.png",
  "cups-10": "Cups10.png",
  "cups-page": "Cups11.png",
  "cups-knight": "Cups12.png",
  "cups-queen": "Cups13.png",
  "cups-king": "Cups14.png",
  "cups-11": "Cups11.png",
  "cups-12": "Cups12.png",
  "cups-13": "Cups13.png",
  "cups-14": "Cups14.png",

  // Swords (1-14)
  "swords-01": "Swords01.png",
  "swords-02": "Swords02.png",
  "swords-03": "Swords03.png",
  "swords-04": "Swords04.png",
  "swords-05": "Swords05.png",
  "swords-06": "Swords06.png",
  "swords-07": "Swords07.png",
  "swords-08": "Swords08.png",
  "swords-09": "Swords09.png",
  "swords-10": "Swords10.png",
  "swords-page": "Swords11.png",
  "swords-knight": "Swords12.png",
  "swords-queen": "Swords13.png",
  "swords-king": "Swords14.png",
  "swords-11": "Swords11.png",
  "swords-12": "Swords12.png",
  "swords-13": "Swords13.png",
  "swords-14": "Swords14.png",

  // Pentacles (1-14) — Named Pents in mixvlad/TarotCards
  "pentacles-01": "Pents01.png",
  "pentacles-02": "Pents02.png",
  "pentacles-03": "Pents03.png",
  "pentacles-04": "Pents04.png",
  "pentacles-05": "Pents05.png",
  "pentacles-06": "Pents06.png",
  "pentacles-07": "Pents07.png",
  "pentacles-08": "Pents08.png",
  "pentacles-09": "Pents09.png",
  "pentacles-10": "Pents10.png",
  "pentacles-page": "Pents11.png",
  "pentacles-knight": "Pents12.png",
  "pentacles-queen": "Pents13.png",
  "pentacles-king": "Pents14.png",
  "pentacles-11": "Pents11.png",
  "pentacles-12": "Pents12.png",
  "pentacles-13": "Pents13.png",
  "pentacles-14": "Pents14.png",
};

const LOCAL_CARDS_BASE = "/cards";

/**
 * Returns the local static URL for a Tarot card's optimized WebP image (SDD §7.1).
 */
export function getCardImageUrl(cardId: string): string {
  const filename = CARD_IMAGE_FILENAME_MAP[cardId];
  if (!filename) {
    // Fallback to Cover if unknown
    return `${LOCAL_CARDS_BASE}/Cover.webp`;
  }
  const baseName = filename.replace(/\.png$/i, "");
  return `${LOCAL_CARDS_BASE}/${baseName}.webp`;
}

/**
 * Returns the card back image URL.
 */
export function getCardBackImageUrl(): string {
  return `${LOCAL_CARDS_BASE}/Cover.webp`;
}
