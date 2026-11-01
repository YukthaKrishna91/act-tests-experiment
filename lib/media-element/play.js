import { __LOG_FUNC } from './attachLog.js';

export async function play(mediaElement) {
  if (typeof mediaElement[__LOG_FUNC] === 'function') {
    const log = mediaElement[__LOG_FUNC];

    log('calling play()');
  }

  return mediaElement.play();
}
