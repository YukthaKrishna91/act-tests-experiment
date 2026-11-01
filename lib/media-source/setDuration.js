import { __LOG_FUNC } from './attachLog.js';

export function setDuration(mediaSource, durationInSeconds) {
  if (typeof mediaSource[__LOG_FUNC] === 'function') {
    const log = mediaSource[__LOG_FUNC];

    log(`setting duration = ${durationInSeconds}`);
  }

  mediaSource.duration = durationInSeconds;
}
