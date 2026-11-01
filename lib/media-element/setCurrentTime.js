import { __LOG_FUNC } from './attachLog.js';

export function setCurrentTime(mediaElement, currentTimeInSeconds) {
  if (typeof mediaElement[__LOG_FUNC] === 'function') {
    const log = mediaElement[__LOG_FUNC];

    log(`setting currentTime = ${currentTimeInSeconds}`);
  }

  mediaElement.currentTime = currentTimeInSeconds;
}
