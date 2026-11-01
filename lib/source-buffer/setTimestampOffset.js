import { __LOG_FUNC } from './attachLog.js';

export function setTimestampOffset(sourceBuffer, timestampOffsetInSeconds) {
  if (typeof sourceBuffer[__LOG_FUNC] === 'function') {
    const log = sourceBuffer[__LOG_FUNC];

    log(`setting timestampOffset = ${timestampOffsetInSeconds}`);
  }

  sourceBuffer.timestampOffset += timestampOffsetInSeconds;
}
