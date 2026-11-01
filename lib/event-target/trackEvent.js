import { addEventListeners } from './addEventListeners.js';

/**
 * @typedef {object} TrackEventResult
 * @property {number} timestamp
 * @property {*} event
 */

/**
 * @param {object} eventTarget
 * @param {string} eventType - the name of the event
 * @returns {[TrackEventResult[], ()=>void]} [tracking results, function to stop tracking]
 */
export function trackEvent(eventTarget, eventType) {
  const results = [];

  const stopTracking = addEventListeners(eventTarget, [eventType], (event) => {
    results.push({
      timestamp: Date.now(),
      event
    });
  });

  return [results, stopTracking];
}
