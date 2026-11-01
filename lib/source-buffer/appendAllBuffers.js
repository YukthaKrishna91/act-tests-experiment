import { appendBuffer } from './appendBuffer.js';

export async function appendAllBuffers(sourceBuffer, buffers) {
  const iter = async () => {
    const buffer = buffers.shift();

    if (buffer == null) {
      return;
    }

    return appendBuffer(sourceBuffer, buffer).then(() => iter());
  };

  return iter();
}
