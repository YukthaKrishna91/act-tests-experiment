import { withinNumericRange } from './withinNumericRange.js';

export function withinNumericTolerance(number, target, tolerance, inclusive = true) {
  return withinNumericRange(
    number,
    [target - tolerance, target + tolerance],
    inclusive ? 'all' : null
  );
}
