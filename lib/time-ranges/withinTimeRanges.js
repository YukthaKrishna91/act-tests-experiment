import { withinNumericRange } from '../maths/withinNumericRange.js';
import { iterateTimeRanges } from './iterateTimeRanges.js';

export function withinTimeRanges(value, ranges) {
  for (const range of iterateTimeRanges(ranges)) {
    if (withinNumericRange(value, range, 'lower')) {
      return true;
    }
  }

  return false;
}
