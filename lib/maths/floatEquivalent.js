/**
 *
 * @param {number} a
 * @param {number} b
 * @param {epsilon} b
 */
export function floatEquivalent(a, b, epsilon = 1.1877e-7) {
  return Math.abs(a - b) < epsilon;
}
