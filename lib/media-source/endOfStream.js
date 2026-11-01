import { __LOG_FUNC } from './attachLog.js';

export function endOfStream(mediaSource) {
  if (typeof mediaSource[__LOG_FUNC] === 'function') {
    const log = mediaSource[__LOG_FUNC];

    log('calling endOfStream()');
  }

  mediaSource.endOfStream();
}
