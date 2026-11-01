'use strict';

import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { PAUSE, PLAY, SEEKED, SEEKING, TIME_UPDATE } from '#lib/media-element/EventType.js';
import { pause } from '#lib/media-element/pause.js';
import { play } from '#lib/media-element/play.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { createSingleRepresentationVideoTemplate } from '#lib/multicheck-test/singleRepresentationVideoTemplate.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';
import { fetchAllSegmentBuffers } from '#lib/streaming-segments/fetchAllSegmentBuffers.js';
import { fetchSegmentBuffer } from '#lib/streaming-segments/fetchSegmentBuffer.js';

export const createTest = createSingleRepresentationVideoTemplate(
  'seeking whilst paused retains paused state',
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

    await Promise.all([waitUntilReady(videoSourceBuffer), waitUntilReady(audioSourceBuffer)]);

    // Play

    const playEvent = expectEvent(videoElement, PLAY);

    play(videoElement);

    actHandle.assert(
      await playEvent(),
      'HTMLMediaElement should emit a "play" event once media playback requested.'
    );

    // Append the Segments

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

    await Promise.all([waitUntilReady(videoSourceBuffer), waitUntilReady(audioSourceBuffer)]);

    // Pause

    const pauseEvent = expectEvent(videoElement, PAUSE);

    pause(videoElement);

    actHandle.assert(
      await pauseEvent(),
      'HTMLMediaElement should emit a "paused" event when paused.'
    );

    actHandle.assert(
      videoElement.paused === true,
      'HTMLMediaElement should be paused following a "paused" event.'
    );

    // Seek to 5 seconds before duration

    const seekingEvent = expectEvent(videoElement, SEEKING);

    setCurrentTime(videoElement, expectedDurationInSeconds - 5);

    actHandle.assert(
      await seekingEvent(),
      'HTMLMediaElement should emit a "seeking" event when seeking.'
    );

    const [audioBuffer, videoBuffer] = await Promise.all([
      fetchAllSegmentBuffers(
        audioSegmentTemplate.getMediaSegmentsForTimeRange(
          availability.getTimeRangeFromPosixRange([bufferFromPosix, bufferToPosix])
        )
      ),
      fetchAllSegmentBuffers(
        videoSegmentTemplate.getMediaSegmentsForTimeRange(
          availability.getTimeRangeFromPosixRange([bufferFromPosix, bufferToPosix])
        )
      )
    ]);

    const timeUpdateEvent = expectEvent(videoElement, TIME_UPDATE);
    const seekedEvent = expectEvent(videoElement, SEEKED);

    await Promise.all([
      appendAllBuffers(audioSourceBuffer, audioBuffer),
      appendAllBuffers(videoSourceBuffer, videoBuffer)
    ]);

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
      videoElement.paused === true,
      'HTMLMediaElement should retain paused state following seek.'
    );
  }
);
