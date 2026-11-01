import { withinNumericRange } from './withinNumericRange.js';

export function areNumericRangesDisjoint([someStart, someEnd], [otherStart, otherEnd]) {
  return (
    !withinNumericRange(someStart, [otherStart, otherEnd], 'all') &&
    !withinNumericRange(someEnd, [otherStart, otherEnd], 'all')
  );
}
