import { isPendingNow } from '../promise/isPendingNow.js';
import { waitForEvent } from './waitForEvent.js';

/**
 * Expect an event to not emit between calling & calling the returned test
 *    - awaiting the test will not wait for the event
 *    - the test only tells you if the event has emitted since its creation
 *
 * @returns {function(): Promise<boolean>} a test: when called, resolves to false if the event emitted
 */
export function expectNoEvent(eventTarget, eventType) {
  const emitted = waitForEvent(eventTarget, eventType, { timeoutInMillis: null });
  return () => isPendingNow(emitted);
}
