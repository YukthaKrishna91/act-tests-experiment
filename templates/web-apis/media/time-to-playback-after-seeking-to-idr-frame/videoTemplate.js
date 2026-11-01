'use strict';

import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { consumeAsyncIterable } from '#lib/async-iterable/consumeAsyncIterable.js';
import { formatNumericDifference } from '#lib/console/formatNumericDifference.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { waitForEvent } from '#lib/event-target/waitForEvent.js';
import { ChunkSource } from '#lib/manifest/ChunkSource.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { intersectNumericRanges } from '#lib/maths/intersectNumericRanges.js';
import { roundToDecimalPlaces } from '#lib/maths/roundToDecimalPlaces.js';
import { withinNumericRange } from '#lib/maths/withinNumericRange.js';
import { withinNumericTolerance } from '#lib/maths/withinNumericTolerance.js';
import {
  ENDED,
  PLAY,
  PLAYING,
  SEEKED,
  SEEKING,
  TIME_UPDATE
} from '#lib/media-element/EventType.js';
import { play } from '#lib/media-element/play.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { TransferEncoding } from '#lib/media-representations.js';
import { endOfStream } from '#lib/media-source/endOfStream.js';
import { SOURCE_ENDED, SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { createSingleRepresentationVideoTemplate } from '#lib/multicheck-test/singleRepresentationVideoTemplate.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';

const CURRENT_TIME_TOLERANCE = 0.1;

/**
 * Test intended for use with CMAF Chunk Encoded assets, such as LL streams
 */
export const createTest = createSingleRepresentationVideoTemplate(
  'time to playback after seeking to IDR frame',
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

    const videoSource = new ChunkSource(videoSegmentTemplate);

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

    const audioSource = new ChunkSource(audioSegmentTemplate);

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

    const bufferSegmentAtPosix = Date.now() - 10_000;
    const bufferSegmentAtTime = seekWindow.getPresentationTimeFromPosixTime(bufferSegmentAtPosix);

    const [bothBufferStartTime, bothBufferEndTime] = intersectNumericRanges(
      audioSegmentTemplate.getTimeRangeContaining(bufferSegmentAtTime),
      videoSegmentTemplate.getTimeRangeContaining(bufferSegmentAtTime)
    );

    const estimatedDurationInSeconds = bothBufferEndTime + 30;
    setDuration(mediaSource, estimatedDurationInSeconds);

    // Older MSE implementations update source buffers on a MediaSource.duration change
    await Promise.all([waitUntilReady(videoSourceBuffer), waitUntilReady(audioSourceBuffer)]);

    // buffer init segments / download media buffers
    await Promise.all([
      appendBuffer(audioSourceBuffer, await audioSource.fetchInitSegment()),
      appendBuffer(videoSourceBuffer, await videoSource.fetchInitSegment())
    ]);

    const audioBuffers = await consumeAsyncIterable(
      audioSource.fetchBuffersForTime(bothBufferStartTime)
    );
    const videoBuffers = await consumeAsyncIterable(
      videoSource.fetchBuffersForTime(bothBufferStartTime)
    );

    // play
    const playHasEmitted = expectEvent(videoElement, PLAY);
    const playingHasEmitted = expectEvent(videoElement, PLAYING);
    const endedHasEmitted = expectEvent(videoElement, ENDED, {
      timeoutInMillis:
        videoRepresentation.transferEncoding === TransferEncoding.Chunked ? 4000 : 7000
    });

    play(videoElement);

    actHandle.assert(
      await playHasEmitted(),
      'MediaElement should emit a "play" event once media playback requested.'
    );

    // seek to start of buffered range
    const seekingHasEmitted = expectEvent(videoElement, SEEKING);
    const timeUpdateHasEmitted = expectEvent(videoElement, TIME_UPDATE);
    const seekedHasEmitted = expectEvent(videoElement, SEEKED);

    const targetTime = bothBufferStartTime;
    setCurrentTime(videoElement, targetTime);

    actHandle.assert(
      await seekingHasEmitted(),
      `MediaElement should emit a "seeking" event after currentTime <- ${targetTime}.`
    );

    const postSeekCurrentTime = videoElement.currentTime;
    actHandle.assert(
      withinNumericTolerance(postSeekCurrentTime, targetTime, CURRENT_TIME_TOLERANCE),
      `MediaElement.currentTime should be ${targetTime} (+/- ${CURRENT_TIME_TOLERANCE}) after currentTime <- ${targetTime}. (got: ${postSeekCurrentTime})`
    );

    // append media buffers
    const preMediaAppendMilliseconds = Date.now();
    const mediaPlayingMilliseconds = waitForEvent(videoElement, PLAYING).then(() => Date.now());
    const initialPlayableBufferLengthSeconds = waitForEvent(videoElement, PLAYING).then(
      () => videoElement.buffered.end(0) - bothBufferStartTime
    );

    await Promise.all([
      appendAllBuffers(audioSourceBuffer, audioBuffers.slice(0, 2)),
      appendAllBuffers(videoSourceBuffer, videoBuffers.slice(0, 2))
    ]);

    const totalPlayableBufferLengthSeconds = videoElement.buffered.end(0) - bothBufferStartTime;

    actHandle.assert(
      withinNumericRange(await initialPlayableBufferLengthSeconds, [0.5, 4], 'all'),
      `Remaining buffer duration should >= 0.5 and <= 4 seconds after currentTime <- ${targetTime}. (got: ${await initialPlayableBufferLengthSeconds} s)`
    );

    // obtain source ended state
    const sourceEndedHasEmitted = expectEvent(mediaSource, SOURCE_ENDED);
    endOfStream(mediaSource);

    actHandle.assert(
      await sourceEndedHasEmitted(),
      'MediaSource should emit a "sourceended" event after endOfStream is called.'
    );

    actHandle.assert(
      await timeUpdateHasEmitted(),
      `MediaElement should emit a "timeupdate" event after currentTime <- ${targetTime}.`
    );

    actHandle.assert(
      await seekedHasEmitted(),
      `MediaElement should emit a "seeked" event after currentTime <- ${targetTime}.`
    );

    actHandle.assert(
      await playingHasEmitted(),
      'MediaElement should emit a "playing" event once media playback requested.'
    );

    const playPerformanceMilliseconds =
      (await mediaPlayingMilliseconds) - preMediaAppendMilliseconds;

    actHandle.assert(
      playPerformanceMilliseconds < 1000,
      `MediaElement should emit "playing" within 1s of first keyframe being decoded. (got: ${playPerformanceMilliseconds} ms)`
    );

    actHandle.assert(
      await endedHasEmitted(),
      'MediaElement should emit an "ended" event once playback reaches duration.'
    );

    const endedTime = videoElement.currentTime;
    const timeProgressed = endedTime - postSeekCurrentTime;

    // Chunked CMAF chunks are typically 0.48-0.96s, standard transfer chunks are typically 3.84-4s
    const expectedApproximatePlaybackTimeSeconds = roundToDecimalPlaces(
      totalPlayableBufferLengthSeconds,
      2
    );

    actHandle.assert(
      withinNumericRange(timeProgressed, [
        expectedApproximatePlaybackTimeSeconds - CURRENT_TIME_TOLERANCE,
        expectedApproximatePlaybackTimeSeconds + CURRENT_TIME_TOLERANCE
      ]),
      `MediaElement.currentTime should increase by ${expectedApproximatePlaybackTimeSeconds} seconds (+/- ${CURRENT_TIME_TOLERANCE}) once playback reaches duration. (got: ${timeProgressed} s) (diff ${formatNumericDifference(timeProgressed, expectedApproximatePlaybackTimeSeconds)})`
    );
  }
);
