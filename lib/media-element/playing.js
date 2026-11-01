import { HAVE_FUTURE_DATA } from './ReadyState.js';

/**
 *
 * @param {HTMLMediaElement} mediaElement
 * @returns {boolean}
 */

export function isPlaying(mediaElement) {
  return (
    !mediaElement.ended &&
    !mediaElement.paused &&
    !mediaElement.seeking &&
    mediaElement.readyState >= HAVE_FUTURE_DATA
  );
}
