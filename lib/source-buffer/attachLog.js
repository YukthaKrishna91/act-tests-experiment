import { addEventListeners } from '../event-target/addEventListeners.js';
import { convertTimeRangesToString } from '../time/convertTimeRangesToString.js';
import * as BufferEventType from './EventType.js';

export const __LOG_FUNC = Symbol('log(SourceBuffer)');

function getMediaKind(codec) {
  if (codec.startsWith('video')) {
    return 'video';
  }

  if (codec.startsWith('audio')) {
    return 'audio';
  }

  throw new TypeError(`Failed to parse media kind from codec string (got ${codec})`);
}

/**
 *
 * @param {SourceBuffer} target
 * @param {Function} logFunc
 * @param {Object} context
 * @param {string} context.type
 * @returns {Function} cleanup
 */
export function attachLog(target, logFunc, { codec } = {}) {
  function log(...parts) {
    logFunc(`SourceBuffer(${getMediaKind(codec)}):`, ...parts);
  }

  target[__LOG_FUNC] = log;

  const removeEventListeners = addEventListeners(
    target,
    [BufferEventType.ABORT, BufferEventType.ERROR, BufferEventType.UPDATE],
    (event) => {
      const { type } = event;

      switch (type) {
        case BufferEventType.UPDATE:
          return log(`${type} (buffered = ${convertTimeRangesToString(target.buffered)})`);
        default:
          return log(type);
      }
    }
  );

  return function cleanup() {
    removeEventListeners();
  };
}
