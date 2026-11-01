# Cheatsheet: Using the Manifest APIs

This doc provides an overview over the APIs in `lib/` to extract data from manifest files for media streams.

## StreamSource API

Provides methods to fetch segments for a source described by a `SourceDescriptor` such as a `SegmentTemplate`

```typescript
interface ByteSource extends EventTarget {
  /**
   * @description get the descriptor used to construct `this`.
   */
  descriptor: SourceDescriptor;

  /**
   * @description get the normalised time ranges for all in-flight fetches.
   */
  fetching: TimeRanges;

  /**
   * @description get the normalised time ranges for all queued fetches.
   */
  queued: TimeRanges;

  /**
   * @description clear all queued fetches.
   */
  clearQueued(): void;

  /**
   * @returns the bytes of the initialisation segment.
   */
  fetchInitSegment(): Promise<ArrayBuffer>;

  /**
   * @yields the bytes of the media segment that contains the provided time.
   */
  fetchBuffersForTime(seconds: number): AsyncGenerator<ArrayBuffer>;

  /**
   * @yields the bytes of each media segment that spans the provided range.
   */
  fetchBuffersForTimeRange([start, end]: [start: number, end: number]): AsyncGenerator<ArrayBuffer>;
}
```

Events:

- `fetchstarted`: Started a fetch operation
- `fetchended`: Ended a fetch operation
- `fetched`: Ended a fetch operation successfully
- `queuechange`: Queued fetches changed

Implemented by:

- [ChunkSource](./ChunkSource.js)
- [SegmentSource](./SegmentSource.js)

## SourceDescriptor API

Provides methods to get segment information from media presentation times.

```typescript
interface SourceDescriptor {
  /**
   * @returns the url of the initialisation segment
   */
  getInitSegment(): string;

  /**
   * @returns the url of the media segment that contains the provided time
   */
  getMediaSegmentForTime(seconds: number): string;

  /**
   * @yields the url of each media segments that spans the provided range
   */
  getMediaSegmentsForTimeRange([start, end]: [start: number, end: number]): Generator<string>;

  /**
   * @returns the start and end time of the media segment that contains the provided time
   */
  getTimeRangeContaining(seconds: number): [number, number];

  /**
   * @yields the start and end time of each media segment that spans the provided range
   */
  getTimeRangesSpanning([start, end]: [start: number, end: number]): Generator<[number, number]>;
}
```

Implemented by:

- [SegmentTemplate](./SegmentTemplate.js)

## Usage

### Seeking

```js
const audioDescriptor = createSegmentTemplateFromManifest(manifest, { mediaKind: 'audio' });

const audioSource = new SegmentSource(audioDescriptor);

const videoDescriptor = createSegmentTemplateFromManifest(manifest, { mediaKind: 'video' });

const videoSource = new SegmentSource(videoDescriptor);

// omitted:
//   - set up media source
//   - set up media element
//   - set up source buffers
//   - buffer init segments

const seekWindow = createSeekWindowFromManifest(manifest);

const targetTime = seekWindow.getPresentationTimeFromPosixTime(Date.now() - 4_000);

const [exactTargetTime] = intersectNumericRanges(
  audioSource.descriptor.getTimeRangeContaining(targetTime),
  videoSource.descriptor.getTimeRangeContaining(targetTime)
);

const isSeeking = expectEvent(mediaElement, SEEKING);

setCurrentTime(mediaElement, targetTime);

await isSeeking();

const hasSeeked = expectEvent(mediaElement, SEEKED);

const audioBuffers = audioSource.fetchBuffersForTime(exactTargetTime);
const videoBuffers = videoSource.fetchBuffersForTime(exactTargetTime);

const [firstAudioBytes, firstVideoBytes] = await Promise.all([
  audioBuffers.next(),
  videoBuffers.next()
]);

await Promise.all([
  appendBuffer(audioSourceBuffer, firstAudioBytes.value),
  appendBuffer(videoSourceBuffer, firstVideoBytes.value)
]);

await hasSeeked();

for await (const bytes of videoBuffers) {
  await appendBuffer(videoSourceBuffer, bytes);
}

for await (const bytes of audioBuffers) {
  await appendBuffer(audioSourceBuffer, bytes);
}
```
