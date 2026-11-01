'use strict';

/**
 * @warning Not intended for partner use
 */

import { withinNumericRange } from '#lib/maths/withinNumericRange.js';
import { floatEquivalent } from '#lib/maths/floatEquivalent.js';
import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { formatNumericDifference } from '#lib/console/formatNumericDifference.js';
import { expectNoEvent } from '#lib/event-target/expectNoEvent.js';
import { waitForEvent } from '#lib/event-target/waitForEvent.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import {
  DURATION_CHANGE,
  PLAY,
  SEEKED,
  SEEKING,
  TIME_UPDATE
} from '#lib/media-element/EventType.js';
import { HAVE_METADATA } from '#lib/media-element/ReadyState.js';
import { play } from '#lib/media-element/play.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { SOURCE_ENDED, SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { endOfStream } from '#lib/media-source/endOfStream.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { setLiveSeekableRange } from '#lib/media-source/setLiveSeekableRange.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { test } from '#lib/multicheck-test/multicheck-test.js';
import { isFulfilled } from '#lib/promise/isFulfilled.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';
import { fetchAllSegmentBuffers } from '#lib/streaming-segments/fetchAllSegmentBuffers.js';
import { fetchSegmentBuffer } from '#lib/streaming-segments/fetchSegmentBuffer.js';
import { allTimeRangesWithinBounds } from '#lib/time/allTimeRangesWithinBounds.js';
import { convertTimeRangesToString } from '#lib/time/convertTimeRangesToString.js';

const DURATION_TOLERANCE = 0.1;

test('seeking from duration to start while ended - debug (desired)', async (actHandle) => {
  // setup
  const mediaSource = setupMediaSource(new MediaSource(), { act: actHandle });
  const isSourceOpened = waitForEvent(mediaSource, SOURCE_OPEN);
  const videoElement = setupMediaElement(
    document.createElement('video'),
    URL.createObjectURL(mediaSource),
    { act: actHandle }
  );

  actHandle.assert(
    await isFulfilled(isSourceOpened),
    'MediaSource should emit a "sourceopen" event once a MediaElement is attached.'
  );

  const postOpenSourceReadyState = mediaSource.readyState;
  actHandle.assert(
    postOpenSourceReadyState === 'open',
    `MediaSource.readyState should be "open" once a MediaElement is attached. (got: ${postOpenSourceReadyState})`
  );

  URL.revokeObjectURL(videoElement.src);

  await actHandle.render(videoElement);

  await actHandle.render(videoElement);

  const manifest = await fetchManifest('bbc-one-fhd');
  const parser = new DOMParser();
  const manifestDocument = parser.parseFromString(manifest.text, 'text/xml');

  const videoSegmentTemplate = createSegmentTemplateFromManifest(
    manifestDocument,
    manifest.baseURL,
    {
      mediaKind: 'video',
      codecs: 'hev1.1.6.L123.B0',
      sampleRate: 50,
      bandwidth: 6500000,
      width: 1920,
      height: 1080
    }
  );

  const audioSegmentTemplate = createSegmentTemplateFromManifest(
    manifestDocument,
    manifest.baseURL,
    {
      mediaKind: 'audio',
      codecs: 'mp4a.40.2',
      sampleRate: 48000,
      bandwidth: 320000
    }
  );

  const videoSourceBuffer = createSourceBuffer(
    mediaSource,
    'video/mp4; codecs="hev1.1.6.L123.B0"',
    {
      act: actHandle
    }
  );

  const audioSourceBuffer = createSourceBuffer(mediaSource, 'audio/mp4; codecs="mp4a.40.2"', {
    act: actHandle
  });

  const availability = createSeekWindowFromManifest(manifestDocument);

  const bufferToPosix = Date.now() - 4_000; // avoid buffering final segment (of varying duration)
  const bufferFromPosix = Date.now() - 6_000;

  const presentationTimeAtCurrentMoment =
    availability.getPresentationTimeFromPosixTime(bufferToPosix);
  const estimatedDurationInSeconds = presentationTimeAtCurrentMoment + 30;
  setDuration(mediaSource, estimatedDurationInSeconds);

  const [, expectedEndOfSegment] = videoSegmentTemplate.getSegmentRange(
    presentationTimeAtCurrentMoment
  );
  const expectedDurationInSeconds = expectedEndOfSegment;

  // Older MSE implementations update source buffers on a MediaSource.duration change
  await Promise.all([waitUntilReady(videoSourceBuffer), waitUntilReady(audioSourceBuffer)]);

  // play (no buffered data to play, however we want to exit the pause state)
  /**
   * note without this, Chromium seems to deviate from spec:
   *  - it will not emit ended
   *  - it will emit waiting
   *  - or, it will playback from start if buffered and play is called after seek to duration
   */
  const emittedPlay = waitForEvent(videoElement, PLAY);
  play(videoElement);

  actHandle.assert(
    await isFulfilled(emittedPlay),
    'MediaElement should emit a "play" event once media playback requested.'
  );

  // buffer segments
  await Promise.all([
    appendBuffer(
      audioSourceBuffer,
      await fetchSegmentBuffer(audioSegmentTemplate.getInitSegment())
    ),
    appendBuffer(videoSourceBuffer, await fetchSegmentBuffer(videoSegmentTemplate.getInitSegment()))
  ]);

  await Promise.all([
    appendAllBuffers(
      audioSourceBuffer,
      await fetchAllSegmentBuffers(
        audioSegmentTemplate.getMediaSegments(
          availability.getTimeRangeFromPosixRange([bufferFromPosix, bufferToPosix])
        )
      )
    ),
    appendAllBuffers(
      videoSourceBuffer,
      await fetchAllSegmentBuffers(
        videoSegmentTemplate.getMediaSegments(
          availability.getTimeRangeFromPosixRange([bufferFromPosix, bufferToPosix])
        )
      )
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
    `MediaSource.duration should equal ${estimatedDurationInSeconds} before endOfStream. (got: ${preEndedSourceDuration} [${formattedPreEndedSourceDurationDifference}])`
  );

  const preEndedElementDuration = videoElement.duration;
  const formattedPreEndedElementDurationDifference = formatNumericDifference(
    preEndedElementDuration,
    estimatedDurationInSeconds
  );
  actHandle.assert(
    floatEquivalent(preEndedElementDuration, estimatedDurationInSeconds),
    `MediaElement.duration should equal ${estimatedDurationInSeconds} before endOfStream. (got: ${preEndedElementDuration} [${formattedPreEndedElementDurationDifference}])`
  );

  // +1 to ensure we seek exactly to the end (media element should clamp it to seekable range)
  const targetTime = expectedDurationInSeconds + 1;

  // set seekable range
  const seekableStartSeconds = targetTime - 10;
  const seekableEndSeconds = targetTime;
  setLiveSeekableRange(mediaSource, [seekableStartSeconds, seekableEndSeconds]);

  const timeRanges = videoElement.seekable;

  /**
   * @warning This assertion is expected to fail
   *
   * This expresses possibly desired future behaviour
   *    - A mechanism to set seekable range even when duration is not infinity
   *    - Chrome is handling MediaElement.seekable as spec intended
   */
  actHandle.assert(
    allTimeRangesWithinBounds(timeRanges, [seekableStartSeconds, seekableEndSeconds]),
    `MediaElement.seekable's ranges should be within [${seekableStartSeconds}-${seekableEndSeconds}]. (got: ${convertTimeRangesToString(timeRanges)})`
  );

  // obtain source ended state
  const hasDurationChanged = waitForEvent(videoElement, DURATION_CHANGE);

  const hasSourceEnded = waitForEvent(mediaSource, SOURCE_ENDED);
  endOfStream(mediaSource);

  actHandle.assert(
    await isFulfilled(hasSourceEnded),
    'MediaSource should emit a "sourceended" event once endOfStream is called.'
  );

  actHandle.assert(
    await isFulfilled(hasDurationChanged),
    'MediaElement should emit a "durationchanged" event once endOfStream is called.'
  );

  const postEndedSourceReadyState = mediaSource.readyState;
  actHandle.assert(
    postEndedSourceReadyState === 'ended',
    `MediaSource.readyState should equal "ended" once endOfStream is called. (got: ${postEndedSourceReadyState})`
  );

  // test currentTime & duration after endOfStream
  const postEndedElementCurrentTime = videoElement.currentTime;
  actHandle.assert(
    postEndedElementCurrentTime === 0,
    `MediaElement.currentTime should be 0. (got: ${postEndedElementCurrentTime})`
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
    `MediaSource.duration should equal ${expectedDurationInSeconds} (+/- ${DURATION_TOLERANCE}) after endOfStream. (got: ${postEndedSourceDuration} [${formattedPostEndedSourceDurationDifference}])`
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
    `MediaElement.duration should equal ${expectedDurationInSeconds} (+/- ${DURATION_TOLERANCE}) after endOfStream. (got: ${postEndedElementDuration} [${formattedPostEndedElementDurationDifference}])`
  );

  // seek to duration
  const hasStartedInitialSeeking = waitForEvent(videoElement, SEEKING);
  const hasCompletedInitialSeeked = waitForEvent(videoElement, SEEKED);

  setCurrentTime(videoElement, targetTime);

  actHandle.assert(
    await isFulfilled(hasStartedInitialSeeking),
    `MediaElement should emit a "seeking" event after currentTime <- ${targetTime}.`
  );

  actHandle.assert(
    await isFulfilled(hasCompletedInitialSeeked),
    `MediaElement should emit a "seeked" event after currentTime <- ${targetTime}.`
  );

  // seek past seekable start
  const hasStartedSeeking = waitForEvent(videoElement, SEEKING);
  const hasTimeUpdated = waitForEvent(videoElement, TIME_UPDATE);
  const hasNotSeeked = expectNoEvent(videoElement, SEEKED);

  setCurrentTime(videoElement, -60);

  actHandle.assert(
    await isFulfilled(hasStartedSeeking),
    `MediaElement should emit a "seeking" event after currentTime <- -60.`
  );

  actHandle.assert(
    await isFulfilled(hasTimeUpdated),
    `MediaElement should emit a "timeupdate" event after currentTime <- -60.`
  );

  const postSeekElementCurrentTime = videoElement.currentTime;
  actHandle.assert(
    postSeekElementCurrentTime === 0,
    `MediaElement.currentTime should be 0. (got: ${postSeekElementCurrentTime})`
  );

  actHandle.assert(
    await hasNotSeeked(),
    `MediaElement should not emit a "seeked" event after currentTime <- -60.`
  );

  const postSeekElementReadyState = videoElement.readyState;
  actHandle.assert(
    postSeekElementReadyState === HAVE_METADATA,
    `MediaElement.readyState should be equal to 1 (HAVE_METADATA) after currentTime <- -60. (got: ${postSeekElementReadyState})`
  );
});
