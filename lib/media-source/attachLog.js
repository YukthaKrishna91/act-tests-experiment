import { addEventListeners } from '../event-target/addEventListeners.js';
import * as SourceEventType from './EventType.js';

export const __LOG_FUNC = Symbol('log(MediaSource)');

/**
 *
 * @param {MediaSource} target
 * @param {Function} logger
 * @returns {Function} cleanup
 */
export function attachLog(target, logFunc) {
  function log(...parts) {
    logFunc('MediaSource:', ...parts);
  }

  target[__LOG_FUNC] = log;

  const removeEventListeners = addEventListeners(
    target,
    Object.values(SourceEventType),
    (event) => {
      const { type } = event;

      log(`${type} (readyState = ${target.readyState})`);
    }
  );

  return function cleanup() {
    removeEventListeners();
  };
}
