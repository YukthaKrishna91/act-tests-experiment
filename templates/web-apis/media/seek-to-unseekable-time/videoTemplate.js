'use strict';

import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { fetchAllSegmentBuffers } from '#lib/streaming-segments/fetchAllSegmentBuffers.js';
import { fetchSegmentBuffer } from '#lib/streaming-segments/fetchSegmentBuffer.js';
import { createSingleRepresentationVideoTemplate } from '#lib/multicheck-test/singleRepresentationVideoTemplate.js';
import { SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { SEEKING, PLAY } from '#lib/media-element/EventType.js';
import { HAVE_METADATA } from '#lib/media-element/ReadyState.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { play } from '#lib/media-element/play.js';
import { setLiveSeekableRange } from '#lib/media-source/setLiveSeekableRange.js';
import { withinNumericTolerance } from '#lib/maths/withinNumericTolerance.js';

const SEEKABLE_TOLERANCE = 0.1;

export const createTest = createSingleRepresentationVideoTemplate(
  'seeking to an unseekable time',
  async (actHandle, { id, videoRepresentation, audioRepresentation }) => {
    const mediaSource = setupMediaSource(new MediaSource(), { act: actHandle });

    const isSourceOpened = expectEvent(mediaSource, SOURCE_OPEN);

    const videoElement = setupMediaElement(
      document.createElement('video'),
      URL.createObjectURL(mediaSource),
      { act: actHandle }
    );

    actHandle.assert(
      await isSourceOpened(),
      'MediaSource should emit a "sourceopen" event once a HTMLMediaElement is attached'
    );

    const postOpenSourceReadyState = mediaSource.readyState;
    actHandle.assert(
      postOpenSourceReadyState === 'open',
      `MediaSource.readyState should be "open" once a HTMLMediaElement is attached. (got: ${postOpenSourceReadyState})`
    );

    URL.revokeObjectURL(videoElement.src);

    await actHandle.render(videoElement);

    const manifest = await fetchManifest(id);
    const parser = new DOMParser();
    const manifestDocument = parser.parseFromString(manifest.text, 'text/xml');

    const videoSegmentTemplate = createSegmentTemplateFromManifest(
      manifestDocument,
      manifest.baseURL,
      {
        width: videoRepresentation.width,
        height: videoRepresentation.height,
        mediaKind: 'video',
        codecs: videoRepresentation.codecs,
        sampleRate: videoRepresentation.sampleRate,
        bandwidth: videoRepresentation.bandwidth
      }
    );

    const audioSegmentTemplate = createSegmentTemplateFromManifest(
      manifestDocument,
      manifest.baseURL,
      {
        mediaKind: 'audio',
        codecs: audioRepresentation.codecs,
        sampleRate: audioRepresentation.sampleRate,
        bandwidth: audioRepresentation.bandwidth
      }
    );

    const videoSourceBuffer = createSourceBuffer(
      mediaSource,
      `video/mp4; codecs="${videoRepresentation.codecs}"`,
      {
        act: actHandle
      }
    );

    const audioSourceBuffer = createSourceBuffer(
      mediaSource,
      `audio/mp4; codecs="${audioRepresentation.codecs}"`,
      {
        act: actHandle
      }
    );

    const availability = createSeekWindowFromManifest(manifestDocument);

    const bufferToPosix = Date.now() - 5_000;
    const bufferFromPosix = Date.now() - 10_000;

    const presentationTimeAtCurrentMoment =
      availability.getPresentationTimeFromPosixTime(bufferToPosix);

    const [, expectedEndOfSegment] = videoSegmentTemplate.getSegmentRange(
      presentationTimeAtCurrentMoment
    );
    const expectedDurationInSeconds = expectedEndOfSegment;

    setDuration(mediaSource, Infinity);

    const seekTarget = expectedDurationInSeconds - 20;
    const initialSeekableStart = expectedDurationInSeconds - 25;
    const initialSeekableEnd = expectedDurationInSeconds;

    // Initial seekable range includes the seek target and buffer
    setLiveSeekableRange(mediaSource, [initialSeekableStart, initialSeekableEnd]);

    await Promise.all([waitUntilReady(videoSourceBuffer), waitUntilReady(audioSourceBuffer)]);

    const emittedPlay = expectEvent(videoElement, PLAY);

    play(videoElement);

    actHandle.assert(
      await emittedPlay(),
      'HTMLMediaElement should emit a "play" event once media playback requested.'
    );

    await Promise.all([
      appendBuffer(
        audioSourceBuffer,
        await fetchSegmentBuffer(audioSegmentTemplate.getInitSegment())
      ),
      appendBuffer(
        videoSourceBuffer,
        await fetchSegmentBuffer(videoSegmentTemplate.getInitSegment())
      )
    ]);

    await Promise.all([
      appendAllBuffers(
        audioSourceBuffer,
        await fetchAllSegmentBuffers(
          audioSegmentTemplate.getMediaSegments(
            availability.getTimeRangeFromPosixRange([bufferFromPosix, bufferToPosix])
          )
        )
      ),
      appendAllBuffers(
        videoSourceBuffer,
        await fetchAllSegmentBuffers(
          videoSegmentTemplate.getMediaSegments(
            availability.getTimeRangeFromPosixRange([bufferFromPosix, bufferToPosix])
          )
        )
      )
    ]);

    // Seek to a time that's currently seekable but not buffered
    const seekingEvent = expectEvent(videoElement, SEEKING);

    setCurrentTime(videoElement, seekTarget);

    actHandle.assert(
      await seekingEvent(),
      'HTMLMediaElement should emit a "seeking" event when seeking to an unbuffered time.'
    );

    actHandle.assert(
      videoElement.seeking,
      `HTMLMediaElement.seeking should be true when seeking. (got: ${videoElement.seeking})`
    );

    // Move seekable range forward, making the seek target unseekable
    // New range starts ~5s before the buffer, therefore excluding the seek target by ~10s
    const newSeekableStart = availability.getPresentationTimeFromPosixTime(bufferFromPosix) - 5;
    const newSeekableEnd = expectedDurationInSeconds;

    setLiveSeekableRange(mediaSource, [newSeekableStart, newSeekableEnd]);

    const seekableStart = videoElement.seekable.start(0);
    const seekableEnd = videoElement.seekable.end(0);
    actHandle.assert(
      withinNumericTolerance(seekableStart, newSeekableStart, SEEKABLE_TOLERANCE) &&
        withinNumericTolerance(seekableEnd, newSeekableEnd, SEEKABLE_TOLERANCE),
      `HTMLMediaElement.seekable should be set to reflect the values set by mediaSource.setLiveSeekableRange, ${newSeekableStart}-${newSeekableEnd} (± ${SEEKABLE_TOLERANCE}). (got: ${seekableStart}-${seekableEnd})`
    );

    // currentTime should be clamped to the new seekable range
    const newCurrentTime = videoElement.currentTime;

    actHandle.assert(
      withinNumericTolerance(newCurrentTime, newSeekableStart, SEEKABLE_TOLERANCE),
      `HTMLMediaElement.currentTime should be clamped to new HTMLMediaElement.seekable start, ${newSeekableStart} (± ${SEEKABLE_TOLERANCE}). (got: ${newCurrentTime})`
    );

    let readyState = videoElement.readyState;
    actHandle.assert(
      readyState === HAVE_METADATA,
      `HTMLMediaElement.readyState should be HAVE_METADATA whilst seeking outside the buffered range. (got: ${readyState})`
    );
  }
);
