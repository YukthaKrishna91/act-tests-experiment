import { addEventListeners } from '../event-target/addEventListeners.js';
import { convertTimeRangesToString } from '../time/convertTimeRangesToString.js';
import { withinTimeRanges } from '../time-ranges/withinTimeRanges.js';
import * as MediaEventType from './EventType.js';

export const __LOG_FUNC = Symbol('log(MediaElement)');

/**
 * @param {HTMLMediaElement} target
 * @param {Function} logFunc
 * @returns {Function} cleanup
 */
export function attachLog(target, logFunc) {
  function log(...parts) {
    logFunc(`${target.nodeName[0] + target.nodeName.slice(1).toLowerCase()}Element:`, ...parts);
  }

  target[__LOG_FUNC] = log;

  const removeEventListeners = addEventListeners(target, Object.values(MediaEventType), (event) => {
    const { type } = event;

    switch (type) {
      case MediaEventType.CAN_PLAY:
        return log(`${type} (readyState = ${target.readyState})`);
      case MediaEventType.DURATION_CHANGE:
        return log(`${type} (duration = ${target.duration})`);
      case MediaEventType.ENDED:
        return log(`${type} (ended = ${target.ended})`);
      case MediaEventType.ERROR:
        return log(`${type} (code = ${target.error?.code} and message = ${target.error?.message})`);
      case MediaEventType.LOADED_DATA:
      case MediaEventType.LOADED_METADATA:
        return log(`${type} (readyState = ${target.readyState})`);
      case MediaEventType.PAUSE:
      case MediaEventType.PLAY:
        return log(`${type} (paused = ${target.paused})`);
      case MediaEventType.RATE_CHANGE:
        return log(`${type} (playbackRate = ${target.playbackRate})`);
      case MediaEventType.SEEKING:
      case MediaEventType.SEEKED:
        return log(`${type} (currentTime = ${target.currentTime} and seeking = ${target.seeking})`);
      case MediaEventType.VOLUME_CHANGE:
        return log(`${type} (muted = ${target.muted} and volume = ${target.volume})`);
      case MediaEventType.TIME_UPDATE:
        return;
      case MediaEventType.PLAYING:
      case MediaEventType.WAITING: {
        const within = withinTimeRanges(target.currentTime, target.buffered);

        return log(
          `${type} (readyState = ${target.readyState} and currentTime ${within ? 'in' : 'not in'} buffered: ${target.currentTime} ${within ? '->' : '><'} ${convertTimeRangesToString(target.buffered)})`
        );
      }
      default:
        return log(type);
    }
  });

  return function cleanup() {
    removeEventListeners();

    delete target[__LOG_FUNC];
  };
}
