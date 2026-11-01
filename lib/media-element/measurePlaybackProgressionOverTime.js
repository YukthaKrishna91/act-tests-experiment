import { waitForTime } from '../promise/waitForTime.js';

export async function measurePlaybackProgressionOverTime(
  mediaEl,
  seconds,
  { verifyTimeToResolve } = {}
) {
  if (typeof seconds !== 'number') {
    throw new TypeError();
  }

  const startTime = mediaEl.currentTime;

  await waitForTime(seconds * 1000, undefined, { verifyTimeToResolve });

  const endTime = mediaEl.currentTime;

  return endTime - startTime;
}
