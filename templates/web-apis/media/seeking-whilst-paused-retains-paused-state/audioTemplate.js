'use strict';

import { SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { fetchAllSegmentBuffers } from '#lib/streaming-segments/fetchAllSegmentBuffers.js';
import { fetchSegmentBuffer } from '#lib/streaming-segments/fetchSegmentBuffer.js';
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
import { PAUSE, SEEKED, SEEKING, PLAY, TIME_UPDATE } from '#lib/media-element/EventType.js';
import { play } from '#lib/media-element/play.js';
import { pause } from '#lib/media-element/pause.js';

export const createTest = createSingleRepresentationAudioTemplate(
  'seeking whilst paused retains paused state',
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

    // Calculate Seek Windows

    const availability = createSeekWindowFromManifest(manifestDocument);

    const bufferToPosix = Date.now() - 4_000;
    const bufferFromPosix = Date.now() - 8_000;

    const presentationTimeAtCurrentMoment =
      availability.getPresentationTimeFromPosixTime(bufferToPosix);

    const [, expectedEndOfSegment] = audioSegmentTemplate.getTimeRangeContaining(
      presentationTimeAtCurrentMoment
    );
    const expectedDurationInSeconds = expectedEndOfSegment;
    setDuration(mediaSource, expectedDurationInSeconds);

    await waitUntilReady(audioSourceBuffer);

    // Play

    const playEvent = expectEvent(audioElement, PLAY);

    play(audioElement);

    actHandle.assert(
      await playEvent(),
      'HTMLMediaElement should emit a "play" event once media playback requested.'
    );

    // Append the Segments

    await appendBuffer(
      audioSourceBuffer,
      await fetchSegmentBuffer(audioSegmentTemplate.getInitSegment())
    );

    await waitUntilReady(audioSourceBuffer);

    // Pause

    const pauseEvent = expectEvent(audioElement, PAUSE);

    pause(audioElement);

    actHandle.assert(
      await pauseEvent(),
      'HTMLMediaElement should emit a "paused" event when paused.'
    );

    actHandle.assert(
      audioElement.paused === true,
      'HTMLMediaElement should be paused following a "paused" event.'
    );

    // Seek to 5 seconds before duration

    const seekingEvent = expectEvent(audioElement, SEEKING);

    setCurrentTime(audioElement, expectedDurationInSeconds - 5);

    const audioBuffer = await fetchAllSegmentBuffers(
      audioSegmentTemplate.getMediaSegmentsForTimeRange(
        availability.getTimeRangeFromPosixRange([bufferFromPosix, bufferToPosix])
      )
    );

    actHandle.assert(
      await seekingEvent(),
      'HTMLMediaElement should emit a "seeking" event when seeking.'
    );

    const timeUpdateEvent = expectEvent(audioElement, TIME_UPDATE);
    const seekedEvent = expectEvent(audioElement, SEEKED);

    await appendAllBuffers(audioSourceBuffer, audioBuffer);

    actHandle.assert(
      await timeUpdateEvent(),
      'HTMLMediaElement should emit a "timeupdate" event when seeking.'
    );

    actHandle.assert(
      await seekedEvent(),
      'HTMLMediaElement should emit a "seeked" event on seek completion.'
    );

    // Check we're still Paused

    actHandle.assert(
      audioElement.paused === true,
      'HTMLMediaElement should retain paused state following seek.'
    );
  }
);
