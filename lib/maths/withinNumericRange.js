/**
 *
 * @param {number} value
 * @param {[lower: number, upper: number]} range
 * @param {'all' | 'lower' | 'upper'} [inclusive]
 */
export function withinNumericRange(value, [lower, upper], inclusive = null) {
  const isWithinLower =
    inclusive === 'all' || inclusive === 'lower' ? value >= lower : value > lower;
  const isWithinUpper =
    inclusive === 'all' || inclusive === 'upper' ? value <= upper : value < upper;

  return isWithinLower && isWithinUpper;
}
