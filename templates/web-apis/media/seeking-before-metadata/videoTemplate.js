'use strict';

import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { expectNoEvent } from '#lib/event-target/expectNoEvent.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { SegmentSource } from '#lib/manifest/SegmentSource.js';
import { intersectNumericRanges } from '#lib/maths/intersectNumericRanges.js';
import { roundToDecimalPlaces } from '#lib/maths/roundToDecimalPlaces.js';
import {
  LOADED_METADATA,
  PLAY,
  PLAYING,
  SEEKED,
  SEEKING,
  TIME_UPDATE,
  WAITING
} from '#lib/media-element/EventType.js';
import { measurePlaybackProgressionOverTime } from '#lib/media-element/measurePlaybackProgressionOverTime.js';
import { play } from '#lib/media-element/play.js';
import { HAVE_ENOUGH_DATA, HAVE_FUTURE_DATA, HAVE_NOTHING } from '#lib/media-element/ReadyState.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { createSingleRepresentationVideoTemplate } from '#lib/multicheck-test/singleRepresentationVideoTemplate.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';

export const createTest = createSingleRepresentationVideoTemplate(
  'seeking before loadedmetadata',
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

    const videoSegmentTemplate = createSegmentTemplateFromManifest(
      manifestDocument,
      manifest.baseURL,
      {
        mediaKind: 'video',
        width: videoRepresentation.width,
        height: videoRepresentation.height,
        codecs: videoRepresentation.codecs,
        sampleRate: videoRepresentation.sampleRate,
        bandwidth: videoRepresentation.bandwidth
      }
    );

    const videoSource = new SegmentSource(videoSegmentTemplate);

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

    const audioSource = new SegmentSource(audioSegmentTemplate);

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

    const seekWindow = createSeekWindowFromManifest(manifestDocument);

    const bufferSegmentAtPosix = Date.now() - 6_000;
    const bufferSegmentAtTime = seekWindow.getPresentationTimeFromPosixTime(bufferSegmentAtPosix);

    const [bothBufferStartTime, bothBufferEndTime] = intersectNumericRanges(
      audioSegmentTemplate.getTimeRangeContaining(bufferSegmentAtTime),
      videoSegmentTemplate.getTimeRangeContaining(bufferSegmentAtTime)
    );

    const estimatedDurationInSeconds = bothBufferEndTime + 30;
    setDuration(mediaSource, estimatedDurationInSeconds);

    // Older MSE implementations update source buffers on a MediaSource.duration change
    await Promise.all([waitUntilReady(videoSourceBuffer), waitUntilReady(audioSourceBuffer)]);

    // play
    const playHasEmitted = expectEvent(videoElement, PLAY);
    const waitingHasEmitted = expectEvent(videoElement, WAITING);

    play(videoElement);

    actHandle.assert(
      await playHasEmitted(),
      'MediaElement should emit a "play" event once media playback requested.'
    );

    actHandle.assert(
      await waitingHasEmitted(),
      'MediaElement should emit a "waiting" event once media playback requested.'
    );

    // seek 2s into future buffered region (before anything has been buffered)
    const seekingHasNotEmitted = expectNoEvent(videoElement, SEEKING);
    const timeUpdateHasNotEmitted = expectNoEvent(videoElement, TIME_UPDATE);
    const seekedHasNotEmitted = expectNoEvent(videoElement, SEEKED);

    const targetTime = bothBufferStartTime + 2;
    setCurrentTime(videoElement, targetTime);

    // brief wait required
    await new Promise((resolve) => setTimeout(resolve, 100));

    actHandle.assert(
      await seekingHasNotEmitted(),
      `MediaElement should not emit a "seeking" event before data is buffered and after currentTime <- ${targetTime}.`
    );

    actHandle.assert(
      await timeUpdateHasNotEmitted(),
      `MediaElement should not emit a "timeupdate" event before data is buffered and after currentTime <- ${targetTime}.`
    );

    actHandle.assert(
      await seekedHasNotEmitted(),
      `MediaElement should not emit a "seeked" event before data is buffered and after currentTime <- ${targetTime}.`
    );

    actHandle.assert(
      videoElement.readyState === HAVE_NOTHING,
      `MediaElement.readyState should be 0 (HAVE_NOTHING) before data is buffered. (got: ${videoElement.readyState})`
    );

    actHandle.assert(
      videoElement.currentTime === targetTime,
      `MediaElement.currentTime should be ${targetTime} before data is buffered. (got: ${videoElement.currentTime})`
    );

    // buffer segments
    const loadedmetadataHasEmitted = expectEvent(videoElement, LOADED_METADATA);
    const seekingHasEmitted = expectEvent(videoElement, SEEKING);

    await Promise.all([
      appendBuffer(audioSourceBuffer, await audioSource.fetchInitSegment()),
      appendBuffer(videoSourceBuffer, await videoSource.fetchInitSegment())
    ]);

    actHandle.assert(
      await loadedmetadataHasEmitted(),
      `MediaElement should emit a "loadedmetadata" event after init segment has buffered.`
    );

    actHandle.assert(
      await seekingHasEmitted(),
      `MediaElement should emit a "seeking" event after init segment has buffered.`
    );

    const audioBuffer = [],
      videoBuffer = [];
    for await (const bytes of audioSource.fetchBuffersForTimeRange([
      bothBufferStartTime,
      bothBufferStartTime + 2
    ]))
      audioBuffer.push(bytes);
    for await (const bytes of videoSource.fetchBuffersForTimeRange([
      bothBufferStartTime,
      bothBufferStartTime + 2
    ]))
      videoBuffer.push(bytes);

    const seekedHasEmitted = expectEvent(videoElement, SEEKED);
    const playingHasEmitted = expectEvent(videoElement, PLAYING);

    await Promise.all([
      appendAllBuffers(audioSourceBuffer, audioBuffer),
      appendAllBuffers(videoSourceBuffer, videoBuffer)
    ]);

    actHandle.assert(
      await seekedHasEmitted(),
      `MediaElement should emit a "seeked" event after data has buffered.`
    );

    const postBufferedReadyState = videoElement.readyState;
    actHandle.assert(
      postBufferedReadyState === HAVE_FUTURE_DATA || postBufferedReadyState === HAVE_ENOUGH_DATA,
      `MediaElement.readyState should be 3 or 4 (HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA) after data has buffered. (got: ${postBufferedReadyState})`
    );

    actHandle.assert(
      await playingHasEmitted(),
      `MediaElement should emit a "playing" event after data has buffered.`
    );

    actHandle.log('MediaElement playing for 2 seconds.');

    const playbackProgress = await measurePlaybackProgressionOverTime(videoElement, 2);

    actHandle.assert(
      playbackProgress > 0,
      `MediaElement.currentTime should have progressed after data has buffered. (got: ${roundToDecimalPlaces(playbackProgress, 2)} seconds)`
    );
  }
);
