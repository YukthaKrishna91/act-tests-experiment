'use strict';

import { withinNumericRange } from '#lib/maths/withinNumericRange.js';
import { fetchManifest } from '#lib/asset/fetchManifest.js';
import {
  ENDED,
  LOADED_DATA,
  LOADED_METADATA,
  PLAY,
  PLAYING,
  SEEKED,
  SEEKING
} from '#lib/media-element/EventType.js';
import { HAVE_FUTURE_DATA, HAVE_METADATA } from '#lib/media-element/ReadyState.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { measurePlaybackProgressionOverTime } from '#lib/media-element/measurePlaybackProgressionOverTime.js';
import { play } from '#lib/media-element/play.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { SOURCE_ENDED, SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { endOfStream } from '#lib/media-source/endOfStream.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { test } from '#lib/multicheck-test/multicheck-test.js';
import { isFulfilled } from '#lib/promise/isFulfilled.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { intersectNumericRanges } from '#lib/maths/intersectNumericRanges.js';
import { formatNumericDifference } from '#lib/console/formatNumericDifference.js';
import { ChunkSource } from '#lib/manifest/ChunkSource.js';

const TOLERANCE = 0.5;

const RD_LL_HEVC_FHD_50FPS = {
  VIDEO: {
    LOWEST: {
      bitrateControl: 'cbr',
      codecFamily: 'hevc',
      codecs: 'hev1.2.4.L90.90',
      bandwidth: 1816136,
      sampleRate: 50,
      width: 768,
      height: 432
    }
  },
  AUDIO: {
    LOWEST: {
      bitrateControl: 'cbr',
      codecFamily: 'aac',
      codecs: 'mp4a.40.2',
      bandwidth: 126536,
      sampleRate: 48000
    }
  }
};

test('example that loads a test stream from assets', async function (actHandle) {
  const mediaSource = setupMediaSource(new MediaSource(), { act: actHandle });

  actHandle.assert(
    mediaSource.readyState === 'closed',
    'MediaSource.readyState should be "closed" before a MediaElement is attached'
  );

  const isSourceOpened = expectEvent(mediaSource, SOURCE_OPEN);

  const videoElement = setupMediaElement(
    document.createElement('video'),
    URL.createObjectURL(mediaSource),
    { act: actHandle }
  );

  actHandle.assert(
    await isSourceOpened(),
    'MediaSource should emit a "sourceopen" event once a MediaElement is attached.'
  );

  actHandle.assert(
    mediaSource.readyState === 'open',
    'MediaSource.readyState should be "open" once a MediaElement is attached'
  );

  URL.revokeObjectURL(videoElement.src);

  await actHandle.render(videoElement);

  const manifest = await fetchManifest('rd-test-card-ll-hevc');
  const parser = new DOMParser();
  const manifestDocument = parser.parseFromString(manifest.text, 'text/xml');

  const videoSegmentTemplate = createSegmentTemplateFromManifest(
    manifestDocument,
    manifest.baseURL,
    {
      mediaKind: 'video',
      ...RD_LL_HEVC_FHD_50FPS.VIDEO.LOWEST
    }
  );

  const videoSource = new ChunkSource(videoSegmentTemplate);

  const audioSegmentTemplate = createSegmentTemplateFromManifest(
    manifestDocument,
    manifest.baseURL,
    {
      mediaKind: 'audio',
      ...RD_LL_HEVC_FHD_50FPS.AUDIO.LOWEST
    }
  );

  const audioSource = new ChunkSource(audioSegmentTemplate);

  const videoSourceBuffer = createSourceBuffer(mediaSource, 'video/mp4; codecs="avc3.64002A"', {
    act: actHandle
  });

  const audioSourceBuffer = createSourceBuffer(mediaSource, 'audio/mp4; codecs="mp4a.40.2"', {
    act: actHandle
  });

  const seekWindow = createSeekWindowFromManifest(manifestDocument);

  const [seekablePosixStart, seekablePosixEnd] = seekWindow.seekablePosixRange;

  const seekablePosixMidpoint = seekablePosixStart + (seekablePosixEnd - seekablePosixStart) / 2;

  const [approxStartTime, approxEndTime] = seekWindow.getTimeRangeFromPosixRange([
    seekablePosixMidpoint,
    seekablePosixMidpoint + 8_000
  ]);

  const [exactStartTime] = intersectNumericRanges(
    audioSegmentTemplate.getTimeRangeContaining(approxStartTime),
    videoSegmentTemplate.getTimeRangeContaining(approxStartTime)
  );

  const [, exactEndTime] = intersectNumericRanges(
    audioSegmentTemplate.getTimeRangeContaining(approxEndTime),
    videoSegmentTemplate.getTimeRangeContaining(approxEndTime)
  );

  setDuration(mediaSource, exactEndTime);

  // Older MSE implementations update source buffers on a MediaSource.duration change
  await Promise.all([waitUntilReady(videoSourceBuffer), waitUntilReady(audioSourceBuffer)]);

  const hasLoadedMetadata = expectEvent(videoElement, LOADED_METADATA);
  const hasStartedSeeking = expectEvent(videoElement, SEEKING);

  setCurrentTime(videoElement, exactStartTime);

  await Promise.all([
    appendBuffer(audioSourceBuffer, await audioSource.fetchInitSegment()),
    appendBuffer(videoSourceBuffer, await videoSource.fetchInitSegment())
  ]);

  actHandle.assert(
    await hasLoadedMetadata(),
    'MediaElement should emit a "loadedmetadata" event once init segments are appended to source buffers'
  );

  actHandle.assert(
    videoElement.readyState === HAVE_METADATA,
    `MediaElement.readyState should be 1 after init segments appended to source buffer. (got ${videoElement.readyState})`
  );

  actHandle.assert(
    await hasStartedSeeking(),
    `MediaElement should emit a "seeking" event after currentTime <- ${exactStartTime}.`
  );

  actHandle.assert(
    videoElement.seeking,
    `MediaElement.seeking should be true after currentTime <- ${exactStartTime}.`
  );

  actHandle.assert(
    videoElement.currentTime === exactStartTime,
    `MediaElement.currentTime should be ${exactStartTime} after currentTime <- ${exactStartTime}. (got ${videoElement.currentTime}) (diff ${formatNumericDifference(videoElement.currentTime, exactStartTime)})`
  );

  const hasLoadedData = expectEvent(videoElement, LOADED_DATA);
  const hasSeeked = expectEvent(videoElement, SEEKED);

  const emittedPlay = expectEvent(videoElement, PLAY);
  const emittedPlaying = expectEvent(videoElement, PLAYING);
  const playPromise = play(videoElement);

  actHandle.assert(
    await emittedPlay(),
    'MediaElement should emit a "play" event once media playback requested.'
  );

  actHandle.assert(
    !videoElement.paused,
    `MediaElement.paused should be false once media playback requested. (got ${videoElement.paused})`
  );

  for await (const buffer of audioSource.fetchBuffersForTimeRange([exactStartTime, exactEndTime])) {
    await appendBuffer(audioSourceBuffer, buffer);
  }

  for await (const buffer of videoSource.fetchBuffersForTimeRange([exactStartTime, exactEndTime])) {
    await appendBuffer(videoSourceBuffer, buffer);
  }

  actHandle.assert(
    await hasLoadedData(),
    'MediaElement should emit a "loadeddata" event the first time data is available at MediaElement.currentTime'
  );

  actHandle.assert(
    videoElement.readyState >= HAVE_FUTURE_DATA,
    'MediaElement.readyState should be greater than or equal to 3 once data is available at MediaElement.currentTime'
  );

  actHandle.assert(
    await hasSeeked(),
    'MediaElement should emit a "seeked" event once data is available at MediaElement.currentTime while seeking'
  );

  actHandle.assert(
    !videoElement.seeking,
    `MediaElement.seeking should be false once data is available at MediaElement.currentTime while seeking. (got ${videoElement.seeking})`
  );

  actHandle.assert(
    videoElement.currentTime === exactStartTime,
    `MediaElement.currentTime should be ${exactStartTime} once seek completed. (got ${videoElement.currentTime}) (diff ${formatNumericDifference(videoElement.currentTime, exactStartTime)})`
  );

  actHandle.assert(
    await emittedPlaying(),
    'MediaElement should emit a "playing" event once playback begins'
  );

  actHandle.assert(
    await isFulfilled(playPromise),
    'The promise returned from MediaElement.play() should resolve once playback begins'
  );

  actHandle.assert(
    videoElement.readyState >= HAVE_FUTURE_DATA,
    `MediaElement.readyState should be greater than or equal to 3 while playing. (got ${videoElement.readyState})`
  );

  const timeSpentPlayingInSeconds = 5;

  const secondsProgressedWhilePlaying = await measurePlaybackProgressionOverTime(
    videoElement,
    timeSpentPlayingInSeconds
  );

  actHandle.assert(
    withinNumericRange(secondsProgressedWhilePlaying, [
      timeSpentPlayingInSeconds - TOLERANCE,
      timeSpentPlayingInSeconds + TOLERANCE
    ]),
    `MediaElement.currentTime should increase by ${timeSpentPlayingInSeconds} seconds (+/- ${TOLERANCE}) after playing for ${timeSpentPlayingInSeconds} seconds. (got ${secondsProgressedWhilePlaying}) (diff ${formatNumericDifference(secondsProgressedWhilePlaying, timeSpentPlayingInSeconds)})`
  );

  const hasSourceEnded = expectEvent(mediaSource, SOURCE_ENDED);
  const hasEnded = expectEvent(videoElement, ENDED, { timeoutInMillis: 10_000 });

  endOfStream(mediaSource);

  actHandle.assert(
    await hasSourceEnded(),
    'MediaSource should emit a "sourceended" event once endOfStream is called.'
  );

  actHandle.assert(
    mediaSource.readyState === 'ended',
    `MediaSource.readyState should be "ended" once endOfStream is called. (got ${mediaSource.readyState})`
  );

  actHandle.assert(
    withinNumericRange(mediaSource.duration, [exactEndTime - 0.1, exactEndTime + 0.1]),
    `MediaSource.duration should be ${exactEndTime} (+/- ${0.1}) after the stream is ended. (got ${mediaSource.duration}) (diff ${formatNumericDifference(mediaSource.duration, exactEndTime)})`
  );

  actHandle.assert(
    withinNumericRange(videoElement.duration, [exactEndTime - 0.1, exactEndTime + 0.1]),
    `MediaElement.duration should be ${exactEndTime} (+/- ${0.1}) after the stream is ended. (got ${videoElement.duration}) (diff ${formatNumericDifference(videoElement.duration, exactEndTime)})`
  );

  actHandle.assert(
    await hasEnded(),
    'MediaElement should emit an "ended" event once playback reaches duration while MediaSource.readyState = "ended"'
  );

  actHandle.assert(
    videoElement.ended,
    `MediaElement.ended should be true once playback ends. (got ${videoElement.ended})`
  );

  actHandle.assert(
    videoElement.paused,
    `MediaElement.paused should be true once playback ends. (got ${videoElement.paused})`
  );

  actHandle.assert(
    withinNumericRange(
      videoElement.currentTime,
      [videoElement.duration - 0.1, videoElement.duration],
      'upper'
    ),
    `MediaElement.currentTime should equal duration ${videoElement.duration} when playback ends. (got ${videoElement.currentTime})`
  );
});
