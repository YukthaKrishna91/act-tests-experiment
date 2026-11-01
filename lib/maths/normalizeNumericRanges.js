export function normalizeNumericRanges(intervals) {
  if (intervals.length <= 1) {
    return intervals;
  }

  const sortedIntervals = [...intervals].sort(
    ([someStart], [otherStart]) => someStart - otherStart
  );

  let previousInterval = sortedIntervals[0];

  const normalizedIntervals = [];

  for (let intervalsSoFar = 1; intervalsSoFar < sortedIntervals.length; intervalsSoFar += 1) {
    const currentInterval = sortedIntervals[intervalsSoFar];

    if (currentInterval[0] <= previousInterval[1]) {
      previousInterval = [previousInterval[0], Math.max(previousInterval[1], currentInterval[1])];
      continue;
    }

    normalizedIntervals.push(previousInterval);
    previousInterval = currentInterval;
  }

  normalizedIntervals.push(previousInterval);

  return normalizedIntervals;
}
