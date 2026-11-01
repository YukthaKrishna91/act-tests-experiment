'use strict';

import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { expectNoEvent } from '#lib/event-target/expectNoEvent.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { SegmentSource } from '#lib/manifest/SegmentSource.js';
import { roundToDecimalPlaces } from '#lib/maths/roundToDecimalPlaces.js';
import { withinNumericTolerance } from '#lib/maths/withinNumericTolerance.js';
import {
  PLAY,
  PLAYING,
  SEEKED,
  SEEKING,
  TIME_UPDATE,
  WAITING
} from '#lib/media-element/EventType.js';
import { measurePlaybackProgressionOverTime } from '#lib/media-element/measurePlaybackProgressionOverTime.js';
import { play } from '#lib/media-element/play.js';
import {
  HAVE_ENOUGH_DATA,
  HAVE_FUTURE_DATA,
  HAVE_METADATA
} from '#lib/media-element/ReadyState.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { createSingleRepresentationAudioTemplate } from '#lib/multicheck-test/singleRepresentationAudioTemplate.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { removeBuffer } from '#lib/source-buffer/removeBuffer.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';

const SEEK_TIME_PLAYBACK_TOLERANCE = 0.1;

export const createTest = createSingleRepresentationAudioTemplate(
  'seeking while seeking',
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

    const bufferSegmentAtPosix = Date.now() - 6_000;
    const bufferSegmentAtTime = seekWindow.getPresentationTimeFromPosixTime(bufferSegmentAtPosix);

    const [bufferedStartTime, bufferedEndTime] =
      audioSegmentTemplate.getTimeRangeContaining(bufferSegmentAtTime);

    const estimatedDurationInSeconds = bufferedEndTime + 30;
    setDuration(mediaSource, estimatedDurationInSeconds);

    // Older MSE implementations update source buffers on a MediaSource.duration change
    await waitUntilReady(audioSourceBuffer);

    // buffer segments
    await appendBuffer(audioSourceBuffer, await audioSource.fetchInitSegment());

    const audioBuffer = [];
    for await (const bytes of audioSource.fetchBuffersForTimeRange([
      bufferedStartTime,
      bufferedStartTime + 2
    ]))
      audioBuffer.push(bytes);

    await appendAllBuffers(audioSourceBuffer, audioBuffer);

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
      `MediaElement should emit a "waiting" event once media playback requested.`
    );

    // seek to start of buffered range
    const firstSeekingHasEmitted = expectEvent(audioElement, SEEKING);
    const firstTimeUpdateHasEmitted = expectEvent(audioElement, TIME_UPDATE);
    const firstSeekedHasEmitted = expectEvent(audioElement, SEEKED);
    const firstPlayingHasEmitted = expectEvent(audioElement, PLAYING);

    const firstTargetTime = bufferedStartTime;
    setCurrentTime(audioElement, firstTargetTime);

    actHandle.assert(
      await firstSeekingHasEmitted(),
      `MediaElement should emit a "seeking" event after currentTime <- ${firstTargetTime}.`
    );

    actHandle.assert(
      await firstTimeUpdateHasEmitted(),
      `MediaElement should emit a "timeupdate" event after currentTime <- ${firstTargetTime}.`
    );

    actHandle.assert(
      await firstSeekedHasEmitted(),
      `MediaElement should emit a "seeked" event after currentTime <- ${firstTargetTime}.`
    );

    const postFirstSeekCurrentTime = audioElement.currentTime;
    actHandle.assert(
      withinNumericTolerance(
        postFirstSeekCurrentTime,
        firstTargetTime,
        SEEK_TIME_PLAYBACK_TOLERANCE
      ),
      `MediaElement.currentTime should be ${firstTargetTime} (+/- ${SEEK_TIME_PLAYBACK_TOLERANCE}) after currentTime <- ${firstTargetTime}. (got: ${postFirstSeekCurrentTime})`
    );

    const postFirstSeekElementReadyState = audioElement.readyState;
    actHandle.assert(
      postFirstSeekElementReadyState === HAVE_FUTURE_DATA ||
        postFirstSeekElementReadyState === HAVE_ENOUGH_DATA,
      `MediaElement.readyState should be equal to 3 or 4 (HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA) after currentTime <- ${firstTargetTime}. (got: ${postFirstSeekElementReadyState})`
    );

    actHandle.assert(
      await firstPlayingHasEmitted(),
      `MediaElement should emit a "playing" event after currentTime <- ${firstTargetTime}.`
    );

    // seek 8s behind buffered range
    const secondSeekingHasEmitted = expectEvent(audioElement, SEEKING);
    const secondWaitingHasEmitted = expectEvent(audioElement, WAITING);
    const secondPlayingHasNotEmitted = expectNoEvent(audioElement, PLAYING);

    const [secondTargetTime] = audioSegmentTemplate.getTimeRangeContaining(firstTargetTime - 8);
    setCurrentTime(audioElement, secondTargetTime);

    actHandle.assert(
      await secondSeekingHasEmitted(),
      `MediaElement should emit a "seeking" event after currentTime <- ${secondTargetTime}.`
    );

    // unbuffer
    await removeBuffer(audioSourceBuffer, [bufferedStartTime, bufferedEndTime]);

    actHandle.assert(
      await secondWaitingHasEmitted(),
      `MediaElement should emit a "waiting" event after currentTime <- ${secondTargetTime}.`
    );

    const postSecondSeekCurrentTime = audioElement.currentTime;
    actHandle.assert(
      withinNumericTolerance(
        postSecondSeekCurrentTime,
        secondTargetTime,
        SEEK_TIME_PLAYBACK_TOLERANCE
      ),
      `MediaElement.currentTime should be ${secondTargetTime} (+/- ${SEEK_TIME_PLAYBACK_TOLERANCE}) after currentTime <- ${secondTargetTime}. (got: ${postSecondSeekCurrentTime})`
    );

    const postSecondSeekElementReadyState = audioElement.readyState;
    actHandle.assert(
      postSecondSeekElementReadyState === HAVE_METADATA,
      `MediaElement.readyState should be equal to 1 (HAVE_METADATA) after currentTime <- ${secondTargetTime}. (got: ${postSecondSeekElementReadyState})`
    );

    // cancel the seek - seek again to 12s behind buffered range
    const thirdSeekingHasEmitted = expectEvent(audioElement, SEEKING);

    const [thirdTargetTime] = audioSegmentTemplate.getTimeRangeContaining(secondTargetTime - 4);
    setCurrentTime(audioElement, thirdTargetTime);

    actHandle.assert(
      await thirdSeekingHasEmitted(),
      `MediaElement should emit a "seeking" event after currentTime <- ${secondTargetTime}.`
    );

    const postThirdSeekCurrentTime = audioElement.currentTime;
    actHandle.assert(
      withinNumericTolerance(
        postThirdSeekCurrentTime,
        thirdTargetTime,
        SEEK_TIME_PLAYBACK_TOLERANCE
      ),
      `MediaElement.currentTime should be ${thirdTargetTime} (+/- ${SEEK_TIME_PLAYBACK_TOLERANCE}) after currentTime <- ${thirdTargetTime}. (got: ${postThirdSeekCurrentTime})`
    );

    const postThirdSeekElementReadyState = audioElement.readyState;
    actHandle.assert(
      postThirdSeekElementReadyState === HAVE_METADATA,
      `MediaElement.readyState should be equal to 1 (HAVE_METADATA) after currentTime <- ${thirdTargetTime}. (got: ${postThirdSeekElementReadyState})`
    );

    actHandle.assert(
      await secondPlayingHasNotEmitted(),
      `MediaElement should not have emitted a "playing" event since currentTime <- ${secondTargetTime}.`
    );

    // buffer data
    const audioBuffer2 = [];
    for await (const bytes of audioSource.fetchBuffersForTimeRange([
      thirdTargetTime,
      thirdTargetTime + 2
    ]))
      audioBuffer2.push(bytes);

    const thirdTimeUpdateHasEmitted = expectEvent(audioElement, TIME_UPDATE);
    const thirdSeekedHasEmitted = expectEvent(audioElement, SEEKED);
    const thirdPlayingHasEmitted = expectEvent(audioElement, PLAYING);

    await appendAllBuffers(audioSourceBuffer, audioBuffer2);

    actHandle.assert(
      await thirdTimeUpdateHasEmitted(),
      `MediaElement should emit a "timeupdate" event after media buffered.`
    );

    actHandle.assert(
      await thirdSeekedHasEmitted(),
      `MediaElement should emit a "seeked" event after media buffered.`
    );

    const postBufferedElementReadyState = audioElement.readyState;
    actHandle.assert(
      postBufferedElementReadyState === HAVE_FUTURE_DATA ||
        postBufferedElementReadyState === HAVE_ENOUGH_DATA,
      `MediaElement.readyState should be equal to 3 or 4 (HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA) after media buffered. (got: ${postBufferedElementReadyState})`
    );

    actHandle.assert(
      await thirdPlayingHasEmitted(),
      `MediaElement should emit a "playing" event after data has buffered.`
    );

    actHandle.log('MediaElement playing for 2 seconds.');

    const playbackProgress = await measurePlaybackProgressionOverTime(audioElement, 2);

    actHandle.assert(
      playbackProgress > 0,
      `MediaElement.currentTime should have progressed after seeking. (got: ${roundToDecimalPlaces(playbackProgress, 2)} seconds)`
    );
  }
);
