'use strict';

import { withinNumericRange } from '#lib/maths/withinNumericRange.js';
import { formatNumericDifference } from '#lib/console/formatNumericDifference.js';
import { SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSingleRepresentationAudioTemplate } from '#lib/multicheck-test/singleRepresentationAudioTemplate.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { SEEKED, SEEKING, PLAY, TIME_UPDATE } from '#lib/media-element/EventType.js';
import { play } from '#lib/media-element/play.js';
import { setTimestampOffset } from '#lib/source-buffer/setTimestampOffset.js';
import { SegmentSource } from '#lib/manifest/SegmentSource.js';
import { waitForEvent } from '#lib/event-target/waitForEvent.js';

export const createTest = createSingleRepresentationAudioTemplate(
  'seeking to time with timestampOffset',
  async (actHandle, { id, audioRepresentation }) => {
    const mediaSource = setupMediaSource(new MediaSource(), { act: actHandle });
    const sourceOpenHasEmitted = expectEvent(mediaSource, SOURCE_OPEN);
    const audioElement = setupMediaElement(
      document.createElement('audio'),
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

    URL.revokeObjectURL(audioElement.src);

    await actHandle.render(audioElement);

    const manifest = await fetchManifest(id);
    const parser = new DOMParser();
    const manifestDocument = parser.parseFromString(manifest.text, 'text/xml');

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

    // Calculate Seek Windows

    const seekWindow = createSeekWindowFromManifest(manifestDocument);

    const timeStampOffsetInSeconds = 5;

    const targetUnixEpochOffset = Date.now() - 8_000;

    const targetPresentationTime =
      seekWindow.getPresentationTimeFromPosixTime(targetUnixEpochOffset);

    const [expectedStartOfSegment, expectedEndOfSegment] =
      audioSource.descriptor.getTimeRangeContaining(targetPresentationTime);

    const expectedDurationInSeconds = expectedEndOfSegment + timeStampOffsetInSeconds;

    setDuration(mediaSource, expectedDurationInSeconds);

    for (const sourceBuffer of mediaSource.sourceBuffers) {
      setTimestampOffset(sourceBuffer, timeStampOffsetInSeconds);
    }

    await waitUntilReady(audioSourceBuffer);

    // Play

    const playEvent = expectEvent(audioElement, PLAY);

    play(audioElement);

    actHandle.assert(
      await playEvent(),
      'HTMLMediaElement should emit a "play" event once media playback requested.'
    );

    // Append the Segments

    await appendBuffer(audioSourceBuffer, await audioSource.fetchInitSegment());

    await waitUntilReady(audioSourceBuffer);

    const seekTime = expectedStartOfSegment + timeStampOffsetInSeconds;

    const seekingEvent = expectEvent(audioElement, SEEKING);

    setCurrentTime(audioElement, seekTime);

    actHandle.assert(
      await seekingEvent(),
      'HTMLMediaElement should emit a "seeking" event when seeking.'
    );

    const audioBytes = await audioSource.fetchBufferForTime(targetPresentationTime);

    const timeUpdateEvent = expectEvent(audioElement, TIME_UPDATE);
    const seekedEvent = expectEvent(audioElement, SEEKED);
    const currentTimePostSeeked = waitForEvent(audioElement, SEEKED).then(
      () => audioElement.currentTime
    );

    await appendBuffer(audioSourceBuffer, audioBytes);

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
