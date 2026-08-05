import { describe, it, expect } from 'vitest';
import { calculateMean, calculateStdDev, calculateZScore, calculatePercentile } from './stats';

describe('calculateMean', () => {
  it('returns 0 for an empty array', () => {
    expect(calculateMean([])).toBe(0);
  });

  it('averages a set of values', () => {
    expect(calculateMean([1, 2, 3, 4, 5])).toBe(3);
  });
});

describe('calculateStdDev', () => {
  it('returns 0 for fewer than 2 values', () => {
    expect(calculateStdDev([])).toBe(0);
    expect(calculateStdDev([5])).toBe(0);
  });

  it('computes sample standard deviation (N-1)', () => {
    // mean=12, deviations -2/0/2, sum of squares=8, /(3-1)=4, sqrt=2
    expect(calculateStdDev([10, 12, 14])).toBeCloseTo(2, 5);
  });
});

describe('calculateZScore', () => {
  it('returns 0 when stdDev is 0 (avoids division by zero)', () => {
    expect(calculateZScore(10, 5, 0)).toBe(0);
  });

  it('computes how many stddevs a value is from the mean', () => {
    expect(calculateZScore(15, 10, 5)).toBe(1);
    expect(calculateZScore(5, 10, 5)).toBe(-1);
  });
});

describe('calculatePercentile', () => {
  it('returns 0 for an empty array', () => {
    expect(calculatePercentile([], 0.5)).toBe(0);
  });

  it('computes the median (P50)', () => {
    expect(calculatePercentile([1, 2, 3, 4, 5], 0.5)).toBe(3);
  });

  it('computes P95 without going out of bounds', () => {
    const values = Array.from({ length: 20 }, (_, i) => i + 1); // 1..20
    expect(calculatePercentile(values, 0.95)).toBe(20);
  });

  it('is not affected by input order (sorts internally)', () => {
    expect(calculatePercentile([5, 1, 4, 2, 3], 0.5)).toBe(3);
  });
});
