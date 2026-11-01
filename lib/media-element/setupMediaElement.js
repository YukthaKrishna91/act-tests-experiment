import { attachLog } from './attachLog.js';

/**
 * @template {HTMLAudioElement | HTMLVideoElement} E
 * @param {E} el
 * @param {MediaSource | HTMLMediaElement["src"]} src
 * @param {Object} options
 * @param {Object} options.act
 * @param {Function?} options.act.log
 * @returns {E}
 */

export function setupMediaElement(el, src, { act } = {}) {
  if (act && typeof act === 'object' && typeof act.log === 'function') {
    attachLog(el, act.log.bind(act));
  }

  el.style.position = 'absolute';
  el.style.top = '0px';
  el.style.left = '0px';
  el.style.width = '100%';
  el.style.height = '100%';

  el.src = src;

  return el;
}
