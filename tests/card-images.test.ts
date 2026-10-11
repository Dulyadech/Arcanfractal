import { describe, it, expect } from "vitest";
import { TAROT_DECK } from "@/data/cards";
import {
  CARD_IMAGE_FILENAME_MAP,
  getCardImageUrl,
  getCardBackImageUrl,
} from "@/lib/tarot/card-images";

describe("Rider-Waite Tarot Card Image Mapping (SDD §7.1, Phase 5)", () => {
  it("maps all 78 Tarot cards in the master deck to Rider-Waite filenames", () => {
    expect(TAROT_DECK).toHaveLength(78);

    TAROT_DECK.forEach((card) => {
      const filename = CARD_IMAGE_FILENAME_MAP[card.id];
      expect(
        filename,
        `Card ID '${card.id}' (${card.name}) should have an image filename`
      ).toBeDefined();
      expect(filename).toMatch(/\.png$/);
    });
  });

  it("generates correct local optimized WebP URLs (SDD §7.1)", () => {
    const foolUrl = getCardImageUrl("fool");
    expect(foolUrl).toBe("/cards/00_Fool.webp");

    const aceWandsUrl = getCardImageUrl("wands-01");
    expect(aceWandsUrl).toBe("/cards/Wands01.webp");

    const queenPentaclesUrl = getCardImageUrl("pentacles-13");
    expect(queenPentaclesUrl).toBe("/cards/Pents13.webp");
  });

  it("returns the standard card back cover WebP image", () => {
    const backUrl = getCardBackImageUrl();
    expect(backUrl).toBe("/cards/Cover.webp");
  });
});
