import { areNumericRangesDisjoint } from './areNumericRangesDisjoint.js';

export function intersectNumericRanges(someRange, otherRange) {
  if (areNumericRangesDisjoint(someRange, otherRange)) {
    return [];
  }

  const [someStart, someEnd] = someRange;
  const [otherStart, otherEnd] = otherRange;

  return [Math.max(someStart, otherStart), Math.min(someEnd, otherEnd)];
}
