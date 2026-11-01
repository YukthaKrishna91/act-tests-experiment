'use strict';

import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { expectNoEvent } from '#lib/event-target/expectNoEvent.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { SegmentSource } from '#lib/manifest/SegmentSource.js';
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
import { createSingleRepresentationAudioTemplate } from '#lib/multicheck-test/singleRepresentationAudioTemplate.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';

export const createTest = createSingleRepresentationAudioTemplate(
  'seeking before loadedmetadata',
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

    const audioSource = new SegmentSource(audioSegmentTemplate);

    const audioSourceBuffer = createSourceBuffer(
      mediaSource,
      `audio/mp4; codecs="${audioRepresentation.codecs}"`,
      {
        act: actHandle
      }
    );

    const seekWindow = createSeekWindowFromManifest(manifestDocument);

    const bufferSegmentAtPosix = Date.now() - 10_000;
    const bufferSegmentAtTime = seekWindow.getPresentationTimeFromPosixTime(bufferSegmentAtPosix);

    const [bufferedStartTime, bufferedEndTime] =
      audioSegmentTemplate.getTimeRangeContaining(bufferSegmentAtTime);

    const estimatedDurationInSeconds = bufferedEndTime + 30;
    setDuration(mediaSource, estimatedDurationInSeconds);

    // Older MSE implementations update source buffers on a MediaSource.duration change
    await waitUntilReady(audioSourceBuffer);

    // play
    const playHasEmitted = expectEvent(audioElement, PLAY);
    const waitingHasEmitted = expectEvent(audioElement, WAITING);

    play(audioElement);

    actHandle.assert(
      await playHasEmitted(),
      'MediaElement should emit a "play" event once media playback requested.'
    );

    actHandle.assert(
      await waitingHasEmitted(),
      'MediaElement should emit a "waiting" event once media playback requested.'
    );

    // seek 2s into future buffered region (before anything has been buffered)
    const seekingHasNotEmitted = expectNoEvent(audioElement, SEEKING);
    const timeUpdateHasNotEmitted = expectNoEvent(audioElement, TIME_UPDATE);
    const seekedHasNotEmitted = expectNoEvent(audioElement, SEEKED);

    const targetTime = bufferedStartTime + 2;
    setCurrentTime(audioElement, targetTime);

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
      audioElement.readyState === HAVE_NOTHING,
      `MediaElement.readyState should be 0 (HAVE_NOTHING) before data is buffered. (got: ${audioElement.readyState})`
    );

    actHandle.assert(
      audioElement.currentTime === targetTime,
      `MediaElement.currentTime should be ${targetTime} before data is buffered. (got: ${audioElement.currentTime})`
    );

    // buffer segments
    const loadedmetadataHasEmitted = expectEvent(audioElement, LOADED_METADATA);
    const seekingHasEmitted = expectEvent(audioElement, SEEKING);

    await appendBuffer(audioSourceBuffer, await audioSource.fetchInitSegment());

    actHandle.assert(
      await loadedmetadataHasEmitted(),
      `MediaElement should emit a "loadedmetadata" event after init segment has buffered.`
    );

    actHandle.assert(
      await seekingHasEmitted(),
      `MediaElement should emit a "seeking" event after init segment has buffered.`
    );

    const audioBuffer = [];
    for await (const bytes of audioSource.fetchBuffersForTimeRange([
      bufferedStartTime,
      bufferedStartTime + 2
    ]))
      audioBuffer.push(bytes);

    const seekedHasEmitted = expectEvent(audioElement, SEEKED);
    const playingHasEmitted = expectEvent(audioElement, PLAYING);

    await appendAllBuffers(audioSourceBuffer, audioBuffer);

    actHandle.assert(
      await seekedHasEmitted(),
      `MediaElement should emit a "seeked" event after data has buffered.`
    );

    const postBufferedReadyState = audioElement.readyState;
    actHandle.assert(
      postBufferedReadyState === HAVE_FUTURE_DATA || postBufferedReadyState === HAVE_ENOUGH_DATA,
      `MediaElement.readyState should be 3 or 4 (HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA) after data has buffered. (got: ${postBufferedReadyState})`
    );

    actHandle.assert(
      await playingHasEmitted(),
      `MediaElement should emit a "playing" event after data has buffered.`
    );

    actHandle.log('MediaElement playing for 2 seconds.');

    const playbackProgress = await measurePlaybackProgressionOverTime(audioElement, 2);

    actHandle.assert(
      playbackProgress > 0,
      `MediaElement.currentTime should have progressed after data has buffered. (got: ${roundToDecimalPlaces(playbackProgress, 2)} seconds)`
    );
  }
);
