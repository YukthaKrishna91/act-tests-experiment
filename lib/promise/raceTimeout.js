import { waitForTime } from './waitForTime.js';
import { throwIfFulfilled } from './throwIfFulfilled.js';

export async function raceTimeout(
  promise,
  {
    timeoutInMillis = 5000,
    timeoutMessage = 'The operation timed out',
    verifyTimeToResolve = undefined
  } = {}
) {
  return Promise.race([
    promise,
    throwIfFulfilled(
      waitForTime(timeoutInMillis, undefined, { verifyTimeToResolve }),
      new DOMException(timeoutMessage, 'TimeoutError')
    )
  ]);
}
