import { __LOG_FUNC } from './attachLog.js';

export function setLiveSeekableRange(mediaSource, [start, end]) {
  if (typeof mediaSource[__LOG_FUNC] === 'function') {
    const log = mediaSource[__LOG_FUNC];

    log(`setting live seekable range = [${start}-${end}]`);
  }

  mediaSource.setLiveSeekableRange(start, end);
}
