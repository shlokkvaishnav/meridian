/**
 * Calculate the mean (average) of an array of numbers
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate the standard deviation of an array of numbers
 * Uses sample standard deviation (N-1) for better estimation on smaller datasets
 */
export function calculateStdDev(values: number[], mean?: number): number {
  if (values.length < 2) return 0; 
  const m = mean ?? calculateMean(values);
  const squareDiffs = values.map(value => Math.pow(value - m, 2));
  const sumSquareDiffs = squareDiffs.reduce((acc, val) => acc + val, 0);
  return Math.sqrt(sumSquareDiffs / (values.length - 1));
}

/**
 * Calculate the Z-Score for a value
 * z = (value - mean) / stdDev
 * 
 * A Z-Score > 2.0 indicates the value is 2 standard deviations above the mean (top ~2.5%)
 */
export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0; // Avoid division by zero
  return (value - mean) / stdDev;
}

/**
 * Calculate percentile (e.g., 0.5 for median/P50, 0.95 for P95)
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor(percentile * sorted.length);
  return sorted[Math.min(index, sorted.length - 1)];
}
