import { withinNumericRange } from '../maths/withinNumericRange.js';
import { measureTimeToResolve } from './measureTimeToResolve.js';

const FLOATING_POINT_TOLERANCE_MS = 2 ** -15;

/**
 * Certifies latency between preferred and actual time-to-dequeue for a task on the JavaScript event loop
 * The aim is to mitigate the fact assertions queued on the event loop will be easier to pass on lower performance
 *
 * @param {() => void} func
 * @param {number} expectedMillis
 * @param {number} acceptedLatencyMillis
 * @returns return value of input function
 */
export async function throwIfTimeToResolveInaccurate(func, expectedMillis, acceptedLatencyMillis) {
  const result = await measureTimeToResolve(func);

  if (
    !withinNumericRange(
      result.millis,
      [expectedMillis - FLOATING_POINT_TOLERANCE_MS, expectedMillis + acceptedLatencyMillis],
      'lower'
    )
  ) {
    throw new Error(
      `setTimeout time-to-dequeue outside expected range ${expectedMillis}-${expectedMillis + acceptedLatencyMillis} ms (got ${result.millis} ms)`
    );
  }

  if (result.status === 'fulfilled') {
    return result.value;
  }

  throw result.reason;
}
