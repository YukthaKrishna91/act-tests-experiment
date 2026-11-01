export function createBinaryPointer({ initialOffset = 0 } = {}) {
  let bytesSoFar = initialOffset ?? 0;

  return {
    get offset() {
      return bytesSoFar;
    },
    useBytes(bytes) {
      try {
        return bytesSoFar;
      } finally {
        bytesSoFar += bytes;
      }
    }
  };
}
