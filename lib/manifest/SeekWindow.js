export class SeekWindow {
  constructor({ posixStart, posixEnd, posixOffset } = {}) {
    this.posixStart = posixStart;
    this.posixEnd = posixEnd;
    this.posixOffset = posixOffset == null ? posixStart : posixOffset;
  }

  get timestampOffsetInMillis() {
    const timestampOffset =
      typeof this.posixOffset === 'function' ? this.posixOffset() : this.posixOffset;

    return timestampOffset instanceof Date ? timestampOffset.getTime() : timestampOffset;
  }

  get seekablePosixRange() {
    const startPosix = typeof this.posixStart === 'function' ? this.posixStart() : this.posixStart;
    const endPosix = typeof this.posixEnd === 'function' ? this.posixEnd() : this.posixEnd;

    const startInMillis = startPosix instanceof Date ? startPosix.getTime() : startPosix;
    const endInMillis = endPosix instanceof Date ? endPosix.getTime() : endPosix;

    if (typeof startInMillis !== 'number' || !Number.isFinite(startInMillis)) {
      throw new TypeError(`Provided start of range is not a finite number. (got ${startInMillis})`);
    }

    if (typeof endInMillis !== 'number' || !Number.isFinite(endInMillis)) {
      throw new TypeError(`Provided end of range is not a finite number. (got ${endInMillis})`);
    }

    return [startInMillis, endInMillis];
  }

  getPresentationTimeFromPosixTime(posixTime) {
    const posixTimeInMillis = posixTime instanceof Date ? posixTime.getTime() : posixTime;

    if (
      typeof posixTimeInMillis !== 'number' ||
      !Number.isFinite(posixTimeInMillis) ||
      posixTimeInMillis < 0
    ) {
      throw new TypeError(`Invalid posix time. (got ${posixTimeInMillis})`);
    }

    const [posixStart, posixEnd] = this.seekablePosixRange;

    if (posixTimeInMillis < posixStart || posixEnd < posixTimeInMillis) {
      throw new TypeError(`Posix time outside seekable range. (got ${posixTimeInMillis})`);
    }

    return (posixTimeInMillis - this.timestampOffsetInMillis) / 1000;
  }

  getTimeRangeFromPosixRange([start, end] = []) {
    return [
      this.getPresentationTimeFromPosixTime(start),
      this.getPresentationTimeFromPosixTime(end)
    ];
  }
}
