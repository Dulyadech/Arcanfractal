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

  it("generates correct full CDN URLs from mixvlad/TarotCards repository", () => {
    const foolUrl = getCardImageUrl("fool");
    expect(foolUrl).toBe(
      "https://raw.githubusercontent.com/mixvlad/TarotCards/main/tarot/rider-waite/full-png/00_Fool.png"
    );

    const aceWandsUrl = getCardImageUrl("wands-01");
    expect(aceWandsUrl).toBe(
      "https://raw.githubusercontent.com/mixvlad/TarotCards/main/tarot/rider-waite/full-png/Wands01.png"
    );

    const queenPentaclesUrl = getCardImageUrl("pentacles-13");
    expect(queenPentaclesUrl).toBe(
      "https://raw.githubusercontent.com/mixvlad/TarotCards/main/tarot/rider-waite/full-png/Pents13.png"
    );
  });

  it("returns the standard card back cover image", () => {
    const backUrl = getCardBackImageUrl();
    expect(backUrl).toBe(
      "https://raw.githubusercontent.com/mixvlad/TarotCards/main/tarot/rider-waite/full-png/Cover.png"
    );
  });
});
