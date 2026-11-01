/**
 * @param  {...(ArrayBuffer | ArrayBufferView<ArrayBuffer>)} arrays
 */
export function mergeByteArrays(...arrays) {
  let totalByteLength = 0;

  for (const bytes of arrays) {
    totalByteLength += bytes.byteLength;
  }

  const accumulatedBytes = new Uint8Array(totalByteLength);

  let bytesWrittenSoFar = 0;

  for (const bytes of arrays) {
    const uint8View =
      bytes instanceof ArrayBuffer
        ? new Uint8Array(bytes)
        : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    accumulatedBytes.set(uint8View, bytesWrittenSoFar);

    bytesWrittenSoFar += uint8View.byteLength;
  }

  return accumulatedBytes.buffer;
}
