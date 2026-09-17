import { describe, it, expect } from 'vitest';
import { clamp, randomBetween } from '../../src/utils/math.js';

describe('clamp', () => {
  it('returns the value when within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to the minimum', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it('clamps to the maximum', () => {
    expect(clamp(42, 0, 10)).toBe(10);
  });
});

describe('randomBetween', () => {
  it('returns a number within the given range', () => {
    for (let i = 0; i < 100; i += 1) {
      const value = randomBetween(2, 5);
      expect(value).toBeGreaterThanOrEqual(2);
      expect(value).toBeLessThanOrEqual(5);
    }
  });
});
