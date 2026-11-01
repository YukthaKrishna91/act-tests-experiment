import { parseBuffer as parseIsobmffBuffer } from 'codem-isoboxer';

function appendChunk(chunk, prevBuffer = null) {
  if (prevBuffer == null) {
    return chunk;
  }

  const nextBuffer = new Uint8Array(prevBuffer.length + chunk.length);

  nextBuffer.set(prevBuffer);

  nextBuffer.set(chunk, prevBuffer.length);

  return nextBuffer;
}

/**
 * Stream a remote ISOBMFF file as a sequence of boxes (aka atoms). Each step yields the box type with the bytes.
 *
 * @param {string | url | Request} url
 */
export async function* fetchIsoBoxes(url) {
  const response = await fetch(url);

  let dataSoFar = null;
  let bytesCompletedSoFar = 0;
  let bytesCompletedSoFarThisChunk = 0;

  const reader = response.body.getReader();

  try {
    while (true) {
      const { done, value: chunk } = await reader.read();

      if (done) break;

      dataSoFar = appendChunk(chunk, dataSoFar);

      const isobmffSoFar = parseIsobmffBuffer(dataSoFar.buffer);

      for (const box of isobmffSoFar.boxes) {
        if (box._incomplete) {
          continue;
        }

        const { size, type, _offset: offset } = box;

        bytesCompletedSoFarThisChunk += size;

        yield {
          type,
          offset: bytesCompletedSoFar + offset,
          bytes: new Uint8Array(dataSoFar.subarray(offset, offset + size))
        };
      }

      bytesCompletedSoFar += bytesCompletedSoFarThisChunk;

      dataSoFar = dataSoFar.subarray(bytesCompletedSoFarThisChunk);

      bytesCompletedSoFarThisChunk = 0;
    }
  } finally {
    reader.releaseLock();
  }
}
