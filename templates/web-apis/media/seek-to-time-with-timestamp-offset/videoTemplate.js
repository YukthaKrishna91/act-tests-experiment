'use strict';

import { withinNumericRange } from '#lib/maths/withinNumericRange.js';
import { formatNumericDifference } from '#lib/console/formatNumericDifference.js';
import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { PLAY, SEEKED, SEEKING, TIME_UPDATE } from '#lib/media-element/EventType.js';
import { play } from '#lib/media-element/play.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { createSingleRepresentationVideoTemplate } from '#lib/multicheck-test/singleRepresentationVideoTemplate.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';
import { setTimestampOffset } from '#lib/source-buffer/setTimestampOffset.js';
import { SegmentSource } from '#lib/manifest/SegmentSource.js';
import { intersectNumericRanges } from '#lib/maths/intersectNumericRanges.js';
import { unionNumericRanges } from '#lib/maths/unionNumericRanges.js';
import { consumeAsyncIterable } from '#lib/async-iterable/consumeAsyncIterable.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { waitForEvent } from '#lib/event-target/waitForEvent.js';

export const createTest = createSingleRepresentationVideoTemplate(
  'seeking to time with timestampOffset',
  async (actHandle, { id, videoRepresentation, audioRepresentation }) => {
    const mediaSource = setupMediaSource(new MediaSource(), { act: actHandle });
    const sourceOpenHasEmitted = expectEvent(mediaSource, SOURCE_OPEN);
    const videoElement = setupMediaElement(
      document.createElement('video'),
      URL.createObjectURL(mediaSource),
      { act: actHandle }
    );

    actHandle.assert(
      await sourceOpenHasEmitted(),
      'MediaSource should emit a "sourceopen" event once a MediaElement is attached.'
    );

    const postOpenSourceReadyState = mediaSource.readyState;
    actHandle.assert(
      postOpenSourceReadyState === 'open',
      `MediaSource.readyState should be "open" once a MediaElement is attached. (got: ${postOpenSourceReadyState})`
    );

    URL.revokeObjectURL(videoElement.src);

    await actHandle.render(videoElement);

    const manifest = await fetchManifest(id);
    const parser = new DOMParser();
    const manifestDocument = parser.parseFromString(manifest.text, 'text/xml');

    const videoSource = new SegmentSource(
      createSegmentTemplateFromManifest(manifestDocument, manifest.baseURL, {
        width: videoRepresentation.width,
        height: videoRepresentation.height,
        mediaKind: 'video',
        codecs: videoRepresentation.codecs,
        sampleRate: videoRepresentation.sampleRate,
        bandwidth: videoRepresentation.bandwidth
      })
    );

    const audioSource = new SegmentSource(
      createSegmentTemplateFromManifest(manifestDocument, manifest.baseURL, {
        mediaKind: 'audio',
        codecs: audioRepresentation.codecs,
        sampleRate: audioRepresentation.sampleRate,
        bandwidth: audioRepresentation.bandwidth
      })
    );

    const audioSourceBuffer = createSourceBuffer(
      mediaSource,
      `audio/mp4; codecs="${audioRepresentation.codecs}"`,
      {
        act: actHandle
      }
    );

    const videoSourceBuffer = createSourceBuffer(
      mediaSource,
      `video/mp4; codecs="${videoRepresentation.codecs}"`,
      {
        act: actHandle
      }
    );

    // Calculate Seek Windows

    const seekWindow = createSeekWindowFromManifest(manifestDocument);

    const timeStampOffsetInSeconds = 5;

    const targetUnixEpochOffset = Date.now() - 8_000;

    const targetPresentationTime =
      seekWindow.getPresentationTimeFromPosixTime(targetUnixEpochOffset);

    const [expectedStartOfBuffered] = intersectNumericRanges(
      audioSource.descriptor.getTimeRangeContaining(targetPresentationTime),
      videoSource.descriptor.getTimeRangeContaining(targetPresentationTime)
    );

    // Sometimes we seek exactly on a segment boundary
    // Buffer full range of segments that include the target presentation time
    const [expectedStartOfStream, expectedEndOfStream] = unionNumericRanges(
      audioSource.descriptor.getTimeRangeContaining(targetPresentationTime),
      videoSource.descriptor.getTimeRangeContaining(targetPresentationTime)
    );

    const expectedDuration = expectedEndOfStream + timeStampOffsetInSeconds;

    setDuration(mediaSource, expectedDuration);

    for (const sourceBuffer of mediaSource.sourceBuffers) {
      setTimestampOffset(sourceBuffer, timeStampOffsetInSeconds);
    }

    await Promise.all([waitUntilReady(videoSourceBuffer), waitUntilReady(audioSourceBuffer)]);

    // Play

    const playEvent = expectEvent(videoElement, PLAY);

    play(videoElement);

    actHandle.assert(
      await playEvent(),
      'HTMLMediaElement should emit a "play" event once media playback requested.'
    );

    // Append the Segments

    const [audioInit, videoInit] = await Promise.all([
      audioSource.fetchInitSegment(),
      videoSource.fetchInitSegment()
    ]);

    await Promise.all([
      appendBuffer(audioSourceBuffer, audioInit),
      appendBuffer(videoSourceBuffer, videoInit)
    ]);

    await Promise.all([waitUntilReady(videoSourceBuffer), waitUntilReady(audioSourceBuffer)]);

    const seekTime = expectedStartOfBuffered + timeStampOffsetInSeconds;

    const seekingEvent = expectEvent(videoElement, SEEKING);

    setCurrentTime(videoElement, seekTime);

    actHandle.log(
      `currentTime is ${expectedStartOfBuffered} offset by +${timeStampOffsetInSeconds}.`
    );

    actHandle.assert(
      await seekingEvent(),
      'HTMLMediaElement should emit a "seeking" event when seeking.'
    );

    const [audioBytes, videoBytes] = await Promise.all([
      consumeAsyncIterable(
        audioSource.fetchBuffersForTimeRange([expectedStartOfStream, expectedEndOfStream])
      ),
      consumeAsyncIterable(
        videoSource.fetchBuffersForTimeRange([expectedStartOfStream, expectedEndOfStream])
      )
    ]);

    const timeUpdateEvent = expectEvent(videoElement, TIME_UPDATE);
    const seekedEvent = expectEvent(videoElement, SEEKED);
    const currentTimePostSeeked = waitForEvent(videoElement, SEEKED).then(
      () => videoElement.currentTime
    );

    await Promise.all([
      appendAllBuffers(audioSourceBuffer, audioBytes),
      appendAllBuffers(videoSourceBuffer, videoBytes)
    ]);

    actHandle.assert(
      await timeUpdateEvent(),
      'HTMLMediaElement should emit a "timeupdate" event when seeking.'
    );

    actHandle.assert(
      await seekedEvent(),
      'HTMLMediaElement should emit a "seeked" event on seek completion.'
    );

    const actualCurrentTime = await currentTimePostSeeked;
    const expectedCurrentTime = seekTime;

    // 100 ms precision expectation
    const currentTimeTolerance = 0.1;

    const formattedpostSeekElementCurrentTimeDifference = formatNumericDifference(
      actualCurrentTime,
      expectedCurrentTime
    );

    actHandle.assert(
      withinNumericRange(actualCurrentTime, [
        expectedCurrentTime - currentTimeTolerance,
        expectedCurrentTime + currentTimeTolerance
      ]),
      `HTMLMediaElement.currentTime should be ${expectedCurrentTime} (+/- ${currentTimeTolerance}). (got: ${actualCurrentTime} [${formattedpostSeekElementCurrentTimeDifference}])`
    );
  }
);
