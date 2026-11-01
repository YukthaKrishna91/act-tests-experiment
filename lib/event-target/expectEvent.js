import { isFulfilled } from '../promise/isFulfilled.js';
import { waitForEvent } from './waitForEvent.js';

/**
 * Expect an event to emit between calling & calling the returned test
 *    - awaiting the test will wait for the event
 *
 * @returns {function(): Promise<boolean>} a test: when called, resolves to true if the event emitted
 */
export function expectEvent(eventTarget, eventType, { timeoutInMillis = 5000 } = {}) {
  const emitted = waitForEvent(eventTarget, eventType, { timeoutInMillis });
  return () => isFulfilled(emitted);
}
