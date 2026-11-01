import { fetchIsoBoxes } from '../isobmff/fetchIsoBoxes.js';
import { mergeIterables } from '../iterable/mergeIterables.js';
import { normalizeNumericRanges } from '../maths/normalizeNumericRanges.js';
import { fetchSegmentBuffer } from '../streaming-segments/fetchSegmentBuffer.js';
import { createTimeRanges } from '../time-ranges/createTimeRanges.js';

/**
 * Stream segments from a `SegmentDescriptor` (f.ex. a `SegmentTemplate` or `AdaptationSet`) as a series of ISOBMFF boxes.
 * Assumes the `SegmentDescriptor` describes an ISOBMFF/CMAF stream.
 */
export class ChunkSource extends EventTarget {
  static FETCH_END = 'fetchended';
  static FETCH_START = 'fetchstarted';
  static FETCHED = 'fetched';
  static QUEUE_CHANGE = 'queuechange';

  constructor(descriptor) {
    super();

    if (descriptor == null || typeof descriptor !== 'object') {
      throw new TypeError(`No source provided. (got '${descriptor}')`);
    }

    this._descriptor = descriptor;

    this._queuedFetchesByUrl = new Map();

    const getQueuedRanges = function () {
      return normalizeNumericRanges(
        [...this._queuedFetchesByUrl.values()].map(({ range }) => range)
      );
    }.bind(this);

    // Always return a reference to the same object
    this._queuedRanges = createTimeRanges({
      get ranges() {
        return getQueuedRanges();
      }
    });

    this._inflightFetchesByUrl = new Map();

    const getInflightRanges = function () {
      return normalizeNumericRanges(
        [...this._inflightFetchesByUrl.values()].map(({ range }) => range)
      );
    }.bind(this);

    // Always return a reference to the same object
    this._inflightRanges = createTimeRanges({
      get ranges() {
        return getInflightRanges();
      }
    });
  }

  async _fetchInitSegment({ url }) {
    try {
      const response = fetchSegmentBuffer(url);

      this.dispatchEvent(new Event(ChunkSource.FETCH_START));

      // await here so `finally` executes after the response comes back
      const buffer = await response;

      this.dispatchEvent(new Event(ChunkSource.FETCHED));

      return buffer;
    } finally {
      this.dispatchEvent(new Event(ChunkSource.FETCH_END));
    }
  }

  async *_fetchMediaSegment({ range, url }) {
    // skip dequeued segment
    if (!this._queuedFetchesByUrl.has(url)) {
      return;
    }

    // dequeue segment as we start the fetch
    this._queuedFetchesByUrl.delete(url);

    if (this._inflightFetchesByUrl.has(url)) {
      const [start, end] = range;

      throw new Error(`Fetch already in-flight for time range [${start}-${end}].`);
    }

    try {
      const boxes = fetchIsoBoxes(url);

      this._inflightFetchesByUrl.set(url, { range });

      this.dispatchEvent(new Event(ChunkSource.FETCH_START));

      for await (const box of boxes) {
        if (box.type !== 'emsg') yield box.bytes.buffer;
      }

      this.dispatchEvent(new Event(ChunkSource.FETCHED));
    } finally {
      this._inflightFetchesByUrl.delete(url);

      this.dispatchEvent(new Event(ChunkSource.FETCH_END));
    }
  }

  async *_fetchMediaSegments(segments) {
    for (const segment of segments) {
      yield* this._fetchMediaSegment(segment);
    }
  }

  get fetching() {
    return this._inflightRanges;
  }

  get queued() {
    return this._queuedRanges;
  }

  clearQueued() {
    this._queuedFetchesByUrl.clear();

    this.dispatchEvent(new Event(ChunkSource.QUEUE_CHANGE));
  }

  async fetchInitSegment() {
    return this._fetchInitSegment({ url: this._descriptor.getInitSegment() });
  }

  fetchBuffersForTime(seconds) {
    const url = this._descriptor.getMediaSegmentForTime(seconds);
    const range = this._descriptor.getTimeRangeContaining(seconds);

    this._queuedFetchesByUrl.set(url, { range });

    this.dispatchEvent(new Event(ChunkSource.QUEUE_CHANGE));

    return this._fetchMediaSegments([{ url, range }]);
  }

  fetchBuffersForTimeRange(timeRange) {
    const segments = [];

    for (const [url, range] of mergeIterables(
      this._descriptor.getMediaSegmentsForTimeRange(timeRange),
      this._descriptor.getTimeRangesSpanning(timeRange)
    )) {
      this._queuedFetchesByUrl.set(url, { range });

      segments.push({ url, range });
    }

    this.dispatchEvent(new Event(ChunkSource.QUEUE_CHANGE));

    return this._fetchMediaSegments(segments);
  }
}
