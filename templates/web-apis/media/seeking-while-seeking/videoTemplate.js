'use strict';

import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { expectNoEvent } from '#lib/event-target/expectNoEvent.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { SegmentSource } from '#lib/manifest/SegmentSource.js';
import { intersectNumericRanges } from '#lib/maths/intersectNumericRanges.js';
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
import { createSingleRepresentationVideoTemplate } from '#lib/multicheck-test/singleRepresentationVideoTemplate.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { removeBuffer } from '#lib/source-buffer/removeBuffer.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';

const SEEK_TIME_PLAYBACK_TOLERANCE = 0.1;

export const createTest = createSingleRepresentationVideoTemplate(
  'seeking while seeking',
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

    const [bufferedStartTime, bufferedEndTime] = intersectNumericRanges(
      audioSegmentTemplate.getTimeRangeContaining(bufferSegmentAtTime),
      videoSegmentTemplate.getTimeRangeContaining(bufferSegmentAtTime)
    );

    const estimatedDurationInSeconds = bufferedEndTime + 30;
    setDuration(mediaSource, estimatedDurationInSeconds);

    // Older MSE implementations update source buffers on a MediaSource.duration change
    await Promise.all([waitUntilReady(videoSourceBuffer), waitUntilReady(audioSourceBuffer)]);

    // buffer segments
    await Promise.all([
      appendBuffer(audioSourceBuffer, await audioSource.fetchInitSegment()),
      appendBuffer(videoSourceBuffer, await videoSource.fetchInitSegment())
    ]);

    const audioBuffer = [],
      videoBuffer = [];
    for await (const bytes of audioSource.fetchBuffersForTimeRange([
      bufferedStartTime,
      bufferedStartTime + 2
    ]))
      audioBuffer.push(bytes);
    for await (const bytes of videoSource.fetchBuffersForTimeRange([
      bufferedStartTime,
      bufferedStartTime + 2
    ]))
      videoBuffer.push(bytes);

    await Promise.all([
      appendAllBuffers(audioSourceBuffer, audioBuffer),
      appendAllBuffers(videoSourceBuffer, videoBuffer)
    ]);

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
      `MediaElement should emit a "waiting" event once media playback requested.`
    );

    // seek to start of buffered range
    const firstSeekingHasEmitted = expectEvent(videoElement, SEEKING);
    const firstTimeUpdateHasEmitted = expectEvent(videoElement, TIME_UPDATE);
    const firstSeekedHasEmitted = expectEvent(videoElement, SEEKED);
    const firstPlayingHasEmitted = expectEvent(videoElement, PLAYING);

    const firstTargetTime = bufferedStartTime;
    setCurrentTime(videoElement, firstTargetTime);

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

    const postFirstSeekCurrentTime = videoElement.currentTime;
    actHandle.assert(
      withinNumericTolerance(
        postFirstSeekCurrentTime,
        firstTargetTime,
        SEEK_TIME_PLAYBACK_TOLERANCE
      ),
      `MediaElement.currentTime should be ${firstTargetTime} (+/- ${SEEK_TIME_PLAYBACK_TOLERANCE}) after currentTime <- ${firstTargetTime}. (got: ${postFirstSeekCurrentTime})`
    );

    const postFirstSeekElementReadyState = videoElement.readyState;
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
    const secondSeekingHasEmitted = expectEvent(videoElement, SEEKING);
    const secondWaitingHasEmitted = expectEvent(videoElement, WAITING);
    const secondPlayingHasNotEmitted = expectNoEvent(videoElement, PLAYING);

    const [secondTargetTime] = videoSegmentTemplate.getTimeRangeContaining(firstTargetTime - 8);
    setCurrentTime(videoElement, secondTargetTime);

    actHandle.assert(
      await secondSeekingHasEmitted(),
      `MediaElement should emit a "seeking" event after currentTime <- ${secondTargetTime}.`
    );

    // unbuffer
    await Promise.all([
      removeBuffer(audioSourceBuffer, [bufferedStartTime, bufferedEndTime]),
      removeBuffer(videoSourceBuffer, [bufferedStartTime, bufferedEndTime])
    ]);

    actHandle.assert(
      await secondWaitingHasEmitted(),
      `MediaElement should emit a "waiting" event after currentTime <- ${secondTargetTime}.`
    );

    const postSecondSeekCurrentTime = videoElement.currentTime;
    actHandle.assert(
      withinNumericTolerance(
        postSecondSeekCurrentTime,
        secondTargetTime,
        SEEK_TIME_PLAYBACK_TOLERANCE
      ),
      `MediaElement.currentTime should be ${secondTargetTime} (+/- ${SEEK_TIME_PLAYBACK_TOLERANCE}) after currentTime <- ${secondTargetTime}. (got: ${postSecondSeekCurrentTime})`
    );

    const postSecondSeekElementReadyState = videoElement.readyState;
    actHandle.assert(
      postSecondSeekElementReadyState === HAVE_METADATA,
      `MediaElement.readyState should be equal to 1 (HAVE_METADATA) after currentTime <- ${secondTargetTime}. (got: ${postSecondSeekElementReadyState})`
    );

    // cancel the seek - seek again to 12s behind buffered range
    const thirdSeekingHasEmitted = expectEvent(videoElement, SEEKING);

    const [thirdTargetTime] = videoSegmentTemplate.getTimeRangeContaining(secondTargetTime - 4);
    setCurrentTime(videoElement, thirdTargetTime);

    actHandle.assert(
      await thirdSeekingHasEmitted(),
      `MediaElement should emit a "seeking" event after currentTime <- ${secondTargetTime}.`
    );

    const postThirdSeekCurrentTime = videoElement.currentTime;
    actHandle.assert(
      withinNumericTolerance(
        postThirdSeekCurrentTime,
        thirdTargetTime,
        SEEK_TIME_PLAYBACK_TOLERANCE
      ),
      `MediaElement.currentTime should be ${thirdTargetTime} (+/- ${SEEK_TIME_PLAYBACK_TOLERANCE}) after currentTime <- ${thirdTargetTime}. (got: ${postThirdSeekCurrentTime})`
    );

    const postThirdSeekElementReadyState = videoElement.readyState;
    actHandle.assert(
      postThirdSeekElementReadyState === HAVE_METADATA,
      `MediaElement.readyState should be equal to 1 (HAVE_METADATA) after currentTime <- ${thirdTargetTime}. (got: ${postThirdSeekElementReadyState})`
    );

    actHandle.assert(
      await secondPlayingHasNotEmitted(),
      `MediaElement should not have emitted a "playing" event since currentTime <- ${secondTargetTime}.`
    );

    // buffer data
    const audioBuffer2 = [],
      videoBuffer2 = [];
    for await (const bytes of audioSource.fetchBuffersForTimeRange([
      thirdTargetTime,
      thirdTargetTime + 2
    ]))
      audioBuffer2.push(bytes);
    for await (const bytes of videoSource.fetchBuffersForTimeRange([
      thirdTargetTime,
      thirdTargetTime + 2
    ]))
      videoBuffer2.push(bytes);

    const thirdTimeUpdateHasEmitted = expectEvent(videoElement, TIME_UPDATE);
    const thirdSeekedHasEmitted = expectEvent(videoElement, SEEKED);
    const thirdPlayingHasEmitted = expectEvent(videoElement, PLAYING);

    await Promise.all([
      appendAllBuffers(audioSourceBuffer, audioBuffer2),
      appendAllBuffers(videoSourceBuffer, videoBuffer2)
    ]);

    actHandle.assert(
      await thirdTimeUpdateHasEmitted(),
      `MediaElement should emit a "timeupdate" event after media buffered.`
    );

    actHandle.assert(
      await thirdSeekedHasEmitted(),
      `MediaElement should emit a "seeked" event after media buffered.`
    );

    const postBufferedElementReadyState = videoElement.readyState;
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

    const playbackProgress = await measurePlaybackProgressionOverTime(videoElement, 2);

    actHandle.assert(
      playbackProgress > 0,
      `MediaElement.currentTime should have progressed after seeking. (got: ${roundToDecimalPlaces(playbackProgress, 2)} seconds)`
    );
  }
);
