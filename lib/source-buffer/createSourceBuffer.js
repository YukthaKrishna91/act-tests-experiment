import { attachLog } from './attachLog.js';

export function createSourceBuffer(mediaSource, codec, { act } = {}) {
  const sourceBuffer = mediaSource.addSourceBuffer(codec);

  if (act && typeof act === 'object' && typeof act.log === 'function') {
    attachLog(sourceBuffer, act.log.bind(act), { codec });
  }

  return sourceBuffer;
}
