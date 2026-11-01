import { raceTimeout } from '../promise/raceTimeout.js';
import { addEventListeners } from './addEventListeners.js';

/**
 * Use `expectEvent` if you only care about the event emitting.
 *
 * @param {EventTarget} eventTarget
 * @param {string} eventType
 * @param {object} [options]
 * @param {number} [options.timeoutInMillis]
 * @returns {Promise<Event>}
 */
export function waitForEvent(eventTarget, eventType, { timeoutInMillis = 5000 } = {}) {
  const emitted = new Promise((resolve) => {
    const removeEventListeners = addEventListeners(eventTarget, [eventType], (event) => {
      removeEventListeners();

      resolve(event);
    });
  });

  return typeof timeoutInMillis === 'number'
    ? raceTimeout(emitted, {
        timeoutInMillis,
        timeoutMessage: `Timed out waiting ${timeoutInMillis}ms for event (got ${eventType})`
      })
    : emitted;
}
