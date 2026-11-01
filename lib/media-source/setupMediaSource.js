import { attachLog } from './attachLog.js';

/**
 * @returns {MediaSource}
 */
export function setupMediaSource(mediaSource, { act } = {}) {
  if (act && typeof act === 'object' && typeof act.log === 'function') {
    attachLog(mediaSource, act.log.bind(act));
  }

  return mediaSource;
}
