/**
 * Returns a cryptographically secure random integer in the range [0, maxExclusive)
 * using Web Crypto API (crypto.getRandomValues).
 *
 * Implements rejection sampling to eliminate modulo bias (SDD §4.1, §7.1).
 *
 * @param maxExclusive The upper bound (exclusive). Must be a positive integer.
 * @returns An integer in [0, maxExclusive) with mathematically uniform distribution.
 */
export function getSecureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) {
    throw new RangeError("maxExclusive must be a positive integer.");
  }
  if (maxExclusive === 1) {
    return 0;
  }

  // 2^32 = 4,294,967,296
  const maxUint32 = 0x100000000;
  // Largest multiple of maxExclusive less than or equal to 2^32
  const limit = maxUint32 - (maxUint32 % maxExclusive);
  const buffer = new Uint32Array(1);

  while (true) {
    crypto.getRandomValues(buffer);
    const rand = buffer[0];
    if (rand < limit) {
      return rand % maxExclusive;
    }
    // In the extremely rare event that rand >= limit (p < 78 / 2^32 ≈ 1.8e-8),
    // reject and resample to completely prevent modulo bias.
  }
}

/**
 * Returns a cryptographically secure random boolean.
 *
 * @param trueProbability The probability of returning true (defaults to 0.5 for 50/50 fair coin toss).
 * @returns boolean
 */
export function getSecureRandomBoolean(trueProbability = 0.5): boolean {
  if (trueProbability <= 0) return false;
  if (trueProbability >= 1) return true;

  // Use a precision of 1,000,000 for high-resolution probability distribution
  const scale = 1_000_000;
  const threshold = Math.round(trueProbability * scale);
  return getSecureRandomInt(scale) < threshold;
}
