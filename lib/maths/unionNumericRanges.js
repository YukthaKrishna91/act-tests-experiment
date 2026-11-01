import { areNumericRangesDisjoint } from './areNumericRangesDisjoint.js';

export function unionNumericRanges(someRange, otherRange) {
  if (areNumericRangesDisjoint(someRange, otherRange)) {
    return [];
  }

  const [someStart, someEnd] = someRange;
  const [otherStart, otherEnd] = otherRange;

  return [Math.min(someStart, otherStart), Math.max(someEnd, otherEnd)];
}
