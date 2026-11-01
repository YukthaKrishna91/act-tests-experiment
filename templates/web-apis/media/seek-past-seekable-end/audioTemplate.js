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
import { createSingleRepresentationAudioTemplate } from '#lib/multicheck-test/singleRepresentationAudioTemplate.js';
import { SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { SEEKING, PLAY } from '#lib/media-element/EventType.js';
import { HAVE_CURRENT_DATA, HAVE_METADATA } from '#lib/media-element/ReadyState.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { play } from '#lib/media-element/play.js';
import { withinNumericTolerance } from '#lib/maths/withinNumericTolerance.js';
import { setLiveSeekableRange } from '#lib/media-source/setLiveSeekableRange.js';

const SEEKABLE_TOLERANCE = 0.1;

export const createTest = createSingleRepresentationAudioTemplate(
  'seeking past seekable range boundaries',
  async (actHandle, { id, audioRepresentation }) => {
    const mediaSource = setupMediaSource(new MediaSource(), { act: actHandle });

    const isSourceOpened = expectEvent(mediaSource, SOURCE_OPEN);

    const audioElement = setupMediaElement(
      document.createElement('audio'),
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

    URL.revokeObjectURL(audioElement.src);

    await actHandle.render(audioElement);

    const manifest = await fetchManifest(id);
    const parser = new DOMParser();
    const manifestDocument = parser.parseFromString(manifest.text, 'text/xml');

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

    const audioSourceBuffer = createSourceBuffer(
      mediaSource,
      `audio/mp4; codecs="${audioRepresentation.codecs}"`,
      {
        act: actHandle
      }
    );

    const availability = createSeekWindowFromManifest(manifestDocument);

    const bufferToPosix = Date.now() - 4_000;
    const bufferFromPosix = Date.now() - 8_000;

    const presentationTimeAtCurrentMoment =
      availability.getPresentationTimeFromPosixTime(bufferToPosix);

    const [, expectedEndOfSegment] = audioSegmentTemplate.getSegmentRange(
      presentationTimeAtCurrentMoment
    );
    const expectedDurationInSeconds = expectedEndOfSegment;
    setDuration(mediaSource, Infinity);

    const expectedSeekableStart = expectedDurationInSeconds - 10;
    const expectedSeekableEnd = expectedDurationInSeconds;
    setLiveSeekableRange(mediaSource, [expectedSeekableStart, expectedSeekableEnd]);

    await waitUntilReady(audioSourceBuffer);

    const playEvent = expectEvent(audioElement, PLAY);

    play(audioElement);

    actHandle.assert(
      await playEvent(),
      'HTMLMediaElement should emit a "play" event once media playback requested.'
    );

    await appendBuffer(
      audioSourceBuffer,
      await fetchSegmentBuffer(audioSegmentTemplate.getInitSegment())
    );

    await appendAllBuffers(
      audioSourceBuffer,
      await fetchAllSegmentBuffers(
        audioSegmentTemplate.getMediaSegments(
          availability.getTimeRangeFromPosixRange([bufferFromPosix, bufferToPosix])
        )
      )
    );

    // Seek before the start of seekable range
    const seekingEvent = expectEvent(audioElement, SEEKING);

    setCurrentTime(audioElement, expectedSeekableEnd + 1);

    actHandle.assert(
      await seekingEvent(),
      'HTMLMediaElement should emit a "seeking" event when seeking beyond HTMLMediaElement.seekable end.'
    );
    actHandle.assert(
      audioElement.seeking,
      'HTMLMediaElement should emit a "seeked" event when seeking has completed.'
    );

    actHandle.assert(
      withinNumericTolerance(audioElement.currentTime, expectedSeekableEnd, SEEKABLE_TOLERANCE),
      `HTMLMediaElement.currentTime should be clamped to HTMLMediaElement.seekable end, ${expectedSeekableEnd} (± ${SEEKABLE_TOLERANCE}). (got: ${audioElement.currentTime})`
    );

    let readyState = audioElement.readyState;
    actHandle.assert(
      readyState === HAVE_METADATA || readyState === HAVE_CURRENT_DATA,
      `HTMLMediaElement.readyState should be HAVE_METADATA or HAVE_CURRENT_DATA whilst seeking past seekable end. (got: ${readyState})`
    );
  }
);
