export function* iterateTimeRanges(ranges) {
  for (let rangesSoFar = 0; rangesSoFar < ranges.length; rangesSoFar += 1) {
    yield [ranges.start(rangesSoFar), ranges.end(rangesSoFar)];
  }
}
