'use strict';

import { withinNumericRange } from '#lib/maths/withinNumericRange.js';
import { floatEquivalent } from '#lib/maths/floatEquivalent.js';
import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { formatNumericDifference } from '#lib/console/formatNumericDifference.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
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
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { SOURCE_ENDED, SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { endOfStream } from '#lib/media-source/endOfStream.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { createSingleRepresentationAudioTemplate } from '#lib/multicheck-test/singleRepresentationAudioTemplate.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';
import { SegmentSource } from '#lib/manifest/SegmentSource.js';

const DURATION_TOLERANCE = 0.1;

export const createTest = createSingleRepresentationAudioTemplate(
  'seeking from duration to start while ended',
  async (actHandle, { id, audioRepresentation }) => {
    // setup
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

    const seekWindow = createSeekWindowFromManifest(manifestDocument);

    // Older MSE implementations update source buffers on a MediaSource.duration change
    await waitUntilReady(audioSourceBuffer);

    const bufferToPosix = Date.now() - 8_000; // avoid buffering final segment (of varying duration)

    const presentationTimeAtCurrentMoment =
      seekWindow.getPresentationTimeFromPosixTime(bufferToPosix);

    const estimatedDurationInSeconds = presentationTimeAtCurrentMoment + 30;

    setDuration(mediaSource, estimatedDurationInSeconds);

    const [, expectedEndOfSegment] = audioSource.descriptor.getSegmentRange(
      presentationTimeAtCurrentMoment
    );

    const expectedDurationInSeconds = expectedEndOfSegment;

    // buffer segments
    await appendBuffer(audioSourceBuffer, await audioSource.fetchInitSegment());

    await appendBuffer(
      audioSourceBuffer,
      await audioSource.fetchBufferForTime(presentationTimeAtCurrentMoment)
    );

    // test currentTime & duration before endOfStream
    const preEndedElementCurrentTime = audioElement.currentTime;
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

    const preEndedElementDuration = audioElement.duration;
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
    const durationChangeHasEmitted = expectEvent(audioElement, DURATION_CHANGE);
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
    const postEndedElementCurrentTime = audioElement.currentTime;
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

    const postEndedElementDuration = audioElement.duration;
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
    const playHasEmitted = expectEvent(audioElement, PLAY);
    play(audioElement);

    actHandle.assert(
      await playHasEmitted(),
      'MediaElement should emit a "play" event once media playback requested.'
    );

    // seek to duration
    const initialSeekingHasEmitted = expectEvent(audioElement, SEEKING);
    const initialSeekedHasEmitted = expectEvent(audioElement, SEEKED);
    const pauseHasEmitted = expectEvent(audioElement, PAUSE);
    const endedHasEmitted = expectEvent(audioElement, ENDED);

    // +1 to ensure we seek exactly to the end (media element should clamp it to seekable range)
    const targetTime = expectedDurationInSeconds + 1;
    setCurrentTime(audioElement, targetTime);

    actHandle.assert(
      await initialSeekingHasEmitted(),
      `MediaElement should emit a "seeking" event after currentTime <- ${targetTime}.`
    );

    actHandle.assert(
      await initialSeekedHasEmitted(),
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
    const seekingHasEmitted = expectEvent(audioElement, SEEKING);

    setCurrentTime(audioElement, 0);

    actHandle.assert(
      await seekingHasEmitted(),
      `MediaElement should emit a "seeking" event after currentTime <- 0.`
    );

    const audioBuffer = await audioSource.fetchBufferForTime(0);

    const timeUpdateHasEmitted = expectEvent(audioElement, TIME_UPDATE);
    const seekedHasEmitted = expectEvent(audioElement, SEEKED);

    await appendBuffer(audioSourceBuffer, audioBuffer);

    actHandle.assert(
      await timeUpdateHasEmitted(),
      `MediaElement should emit a "timeupdate" event after currentTime <- 0.`
    );

    actHandle.assert(
      await seekedHasEmitted(),
      `MediaElement should emit a "seeked" event after currentTime <- 0.`
    );

    const postSeekToStartElementCurrentTime = audioElement.currentTime;
    actHandle.assert(
      postSeekToStartElementCurrentTime === 0,
      `MediaElement.currentTime should be 0 after currentTime <- 0. (got: ${postSeekToStartElementCurrentTime})`
    );

    const postSeekElementReadyState = audioElement.readyState;
    actHandle.assert(
      postSeekElementReadyState === HAVE_FUTURE_DATA ||
        postSeekElementReadyState === HAVE_ENOUGH_DATA,
      `MediaElement.readyState should be equal to 3 or 4 (HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA) after currentTime <- 0. (got: ${postSeekElementReadyState})`
    );
  }
);
