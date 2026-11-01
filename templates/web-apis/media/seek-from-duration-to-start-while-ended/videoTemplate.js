'use strict';

import { withinNumericRange } from '#lib/maths/withinNumericRange.js';
import { floatEquivalent } from '#lib/maths/floatEquivalent.js';
import { formatNumericDifference } from '#lib/console/formatNumericDifference.js';
import {
  DURATION_CHANGE,
  ENDED,
  PAUSE,
  PLAY,
  SEEKED,
  SEEKING,
  TIME_UPDATE
} from '#lib/media-element/EventType.js';
import { HAVE_ENOUGH_DATA, HAVE_FUTURE_DATA } from '#lib/media-element/ReadyState.js';
import { play } from '#lib/media-element/play.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { SOURCE_ENDED, SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { endOfStream } from '#lib/media-source/endOfStream.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSingleRepresentationVideoTemplate } from '#lib/multicheck-test/singleRepresentationVideoTemplate.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { SegmentSource } from '#lib/manifest/SegmentSource.js';

const DURATION_TOLERANCE = 0.1;

export const createTest = createSingleRepresentationVideoTemplate(
  'seeking from duration to start while ended',
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
        mediaKind: 'video',
        width: videoRepresentation.width,
        height: videoRepresentation.height,
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

    // Older MSE implementations update source buffers on a MediaSource.duration change
    await Promise.all([waitUntilReady(videoSourceBuffer), waitUntilReady(audioSourceBuffer)]);

    const bufferToPosix = Date.now() - 8_000; // avoid buffering final segment (of varying duration)

    const presentationTimeAtCurrentMoment =
      seekWindow.getPresentationTimeFromPosixTime(bufferToPosix);

    const estimatedDurationInSeconds = presentationTimeAtCurrentMoment + 30;

    setDuration(mediaSource, estimatedDurationInSeconds);

    const [, expectedEndOfSegment] = videoSource.descriptor.getSegmentRange(
      presentationTimeAtCurrentMoment
    );

    const expectedDurationInSeconds = expectedEndOfSegment;

    // buffer segments
    await Promise.all([
      appendBuffer(audioSourceBuffer, await audioSource.fetchInitSegment()),
      appendBuffer(videoSourceBuffer, await videoSource.fetchInitSegment())
    ]);

    await Promise.all([
      appendBuffer(
        audioSourceBuffer,
        await audioSource.fetchBufferForTime(presentationTimeAtCurrentMoment)
      ),
      appendBuffer(
        videoSourceBuffer,
        await videoSource.fetchBufferForTime(presentationTimeAtCurrentMoment)
      )
    ]);

    // test currentTime & duration before endOfStream
    const preEndedElementCurrentTime = videoElement.currentTime;
    actHandle.assert(
      preEndedElementCurrentTime === 0,
      `MediaElement.currentTime should be 0 (default state for currentTime). (got: ${preEndedElementCurrentTime})`
    );

    const preEndedSourceDuration = mediaSource.duration;
    const formattedPreEndedSourceDurationDifference = formatNumericDifference(
      preEndedSourceDuration,
      estimatedDurationInSeconds
    );
    actHandle.assert(
      floatEquivalent(preEndedSourceDuration, estimatedDurationInSeconds),
      `MediaSource.duration should equal ${estimatedDurationInSeconds} before endOfStream is called. (got: ${preEndedSourceDuration} [${formattedPreEndedSourceDurationDifference}])`
    );

    const preEndedElementDuration = videoElement.duration;
    const formattedPreEndedElementDurationDifference = formatNumericDifference(
      preEndedElementDuration,
      estimatedDurationInSeconds
    );
    actHandle.assert(
      floatEquivalent(preEndedElementDuration, estimatedDurationInSeconds),
      `MediaElement.duration should equal ${estimatedDurationInSeconds} before endOfStream is called. (got: ${preEndedElementDuration} [${formattedPreEndedElementDurationDifference}])`
    );

    // obtain source ended state
    const sourceEndedHasEmitted = expectEvent(mediaSource, SOURCE_ENDED);
    const durationChangeHasEmitted = expectEvent(videoElement, DURATION_CHANGE);
    endOfStream(mediaSource);

    actHandle.assert(
      await sourceEndedHasEmitted(),
      'MediaSource should emit a "sourceended" event after endOfStream is called.'
    );

    actHandle.assert(
      await durationChangeHasEmitted(),
      'MediaElement should emit a "durationchanged" event after endOfStream is called.'
    );

    const postEndedSourceReadyState = mediaSource.readyState;
    actHandle.assert(
      postEndedSourceReadyState === 'ended',
      `MediaSource.readyState should equal "ended" after endOfStream is called. (got: ${postEndedSourceReadyState})`
    );

    // test currentTime & duration after endOfStream
    const postEndedElementCurrentTime = videoElement.currentTime;
    actHandle.assert(
      postEndedElementCurrentTime === 0,
      `MediaElement.currentTime should be 0 after endOfStream is called. (got: ${postEndedElementCurrentTime})`
    );

    const postEndedSourceDuration = mediaSource.duration;
    const formattedPostEndedSourceDurationDifference = formatNumericDifference(
      postEndedSourceDuration,
      expectedDurationInSeconds
    );
    actHandle.assert(
      withinNumericRange(postEndedSourceDuration, [
        expectedDurationInSeconds - DURATION_TOLERANCE,
        expectedDurationInSeconds + DURATION_TOLERANCE
      ]),
      `MediaSource.duration should equal ${expectedDurationInSeconds} (+/- ${DURATION_TOLERANCE}) after endOfStream is called. (got: ${postEndedSourceDuration} [${formattedPostEndedSourceDurationDifference}])`
    );

    const postEndedElementDuration = videoElement.duration;
    const formattedPostEndedElementDurationDifference = formatNumericDifference(
      postEndedElementDuration,
      expectedDurationInSeconds
    );
    actHandle.assert(
      withinNumericRange(postEndedElementDuration, [
        expectedDurationInSeconds - DURATION_TOLERANCE,
        expectedDurationInSeconds + DURATION_TOLERANCE
      ]),
      `MediaElement.duration should equal ${expectedDurationInSeconds} (+/- ${DURATION_TOLERANCE}) after endOfStream is called. (got: ${postEndedElementDuration} [${formattedPostEndedElementDurationDifference}])`
    );

    // play
    /**
     * note without this, Chromium seems to deviate from spec:
     *  - it will not emit ended
     */
    const playHasEmitted = expectEvent(videoElement, PLAY);
    play(videoElement);

    actHandle.assert(
      await playHasEmitted(),
      'MediaElement should emit a "play" event once media playback requested.'
    );

    // seek to duration
    const initialSeekingHasEmitted = expectEvent(videoElement, SEEKING);
    const hasCompletedInitialSeeked = expectEvent(videoElement, SEEKED);
    const pauseHasEmitted = expectEvent(videoElement, PAUSE);
    const endedHasEmitted = expectEvent(videoElement, ENDED);

    // +1 to ensure we seek exactly to the end (media element should clamp it to seekable range)
    const targetTime = expectedDurationInSeconds + 1;
    setCurrentTime(videoElement, targetTime);

    actHandle.assert(
      await initialSeekingHasEmitted(),
      `MediaElement should emit a "seeking" event after currentTime <- ${targetTime}.`
    );

    actHandle.assert(
      await hasCompletedInitialSeeked(),
      `MediaElement should emit a "seeked" event after currentTime <- ${targetTime}.`
    );

    // obtain element ended state
    actHandle.assert(
      await pauseHasEmitted(),
      'MediaElement should emit a "pause" event once playback reaches duration.'
    );

    actHandle.assert(
      await endedHasEmitted(),
      'MediaElement should emit an "ended" event once playback reaches duration.'
    );

    // seek to start
    const seekingHasEmitted = expectEvent(videoElement, SEEKING);

    setCurrentTime(videoElement, 0);

    actHandle.assert(
      await seekingHasEmitted(),
      `MediaElement should emit a "seeking" event after currentTime <- 0.`
    );

    const [audioBuffer, videoBuffer] = await Promise.all([
      audioSource.fetchBufferForTime(0),
      videoSource.fetchBufferForTime(0)
    ]);

    const timeUpdateHasEmitted = expectEvent(videoElement, TIME_UPDATE);
    const seekedHasEmitted = expectEvent(videoElement, SEEKED);

    await Promise.all([
      appendBuffer(audioSourceBuffer, audioBuffer),
      appendBuffer(videoSourceBuffer, videoBuffer)
    ]);

    actHandle.assert(
      await timeUpdateHasEmitted(),
      `MediaElement should emit a "timeupdate" event after currentTime <- 0.`
    );

    actHandle.assert(
      await seekedHasEmitted(),
      `MediaElement should emit a "seeked" event after currentTime <- 0.`
    );

    const postSeekToStartElementCurrentTime = videoElement.currentTime;
    actHandle.assert(
      postSeekToStartElementCurrentTime === 0,
      `MediaElement.currentTime should be 0 after currentTime <- 0. (got: ${postSeekToStartElementCurrentTime})`
    );

    const postSeekElementReadyState = videoElement.readyState;
    actHandle.assert(
      postSeekElementReadyState === HAVE_FUTURE_DATA ||
        postSeekElementReadyState === HAVE_ENOUGH_DATA,
      `MediaElement.readyState should be equal to 3 or 4 (HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA) after currentTime <- 0. (got: ${postSeekElementReadyState})`
    );
  }
);
