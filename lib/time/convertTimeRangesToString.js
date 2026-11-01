export function convertTimeRangesToString(timeRanges) {
  const parts = [];

  for (let rangesSoFar = 0; rangesSoFar <= timeRanges.length - 1; rangesSoFar += 1) {
    parts.push(`${timeRanges.start(rangesSoFar)}-${timeRanges.end(rangesSoFar)}`);
  }

  return `TimeRanges: [${parts.join(', ')}]`;
}
