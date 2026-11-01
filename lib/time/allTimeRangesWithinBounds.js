export function allTimeRangesWithinBounds(timeRanges, [start, end]) {
  for (let count = 0; count < timeRanges.length; count++) {
    if (timeRanges.start(count) < start) return false;
    if (timeRanges.end(count) > end) return false;
  }
  return true;
}
