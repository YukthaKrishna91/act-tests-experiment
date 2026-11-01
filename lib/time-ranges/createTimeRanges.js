export function createTimeRanges(source) {
  function start(index) {
    const range = source.ranges[index];

    if (range == null) {
      throw new DOMException(
        `Index ${index} is not within range 0-${source.ranges.length}`,
        'IndexSizeError'
      );
    }

    return range[0];
  }

  function end(index) {
    const range = source.ranges[index];

    if (range == null) {
      throw new DOMException(
        `Index ${index} is not within range 0-${source.ranges.length}`,
        'IndexSizeError'
      );
    }

    return range[1];
  }

  return {
    start,
    end,
    get length() {
      return source.ranges.length;
    }
  };
}
