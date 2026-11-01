'use strict';

import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { withinNumericTolerance } from '#lib/maths/withinNumericTolerance.js';
import { PAUSE, PLAY, PLAYING } from '#lib/media-element/EventType.js';
import { measurePlaybackProgressionOverTime } from '#lib/media-element/measurePlaybackProgressionOverTime.js';
import { pause } from '#lib/media-element/pause.js';
import { play } from '#lib/media-element/play.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { setLiveSeekableRange } from '#lib/media-source/setLiveSeekableRange.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { createSingleRepresentationVideoTemplate } from '#lib/multicheck-test/singleRepresentationVideoTemplate.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { removeBuffer } from '#lib/source-buffer/removeBuffer.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';
import { fetchAllSegmentBuffers } from '#lib/streaming-segments/fetchAllSegmentBuffers.js';
import { fetchSegmentBuffer } from '#lib/streaming-segments/fetchSegmentBuffer.js';
import { withinNumericRange } from '#lib/maths/withinNumericRange.js';

/**
 * template designed only for on-demand assets
 * @exploratory
 */

const PLAYBACK_TIME_TOLERANCE_MS = 200;

export const createTest = createSingleRepresentationVideoTemplate(
  'pausing',
  async (actHandle, { id, videoRepresentation }) => {
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

    const videoSourceBuffer = createSourceBuffer(
      mediaSource,
      `video/mp4; codecs="${videoRepresentation.codecs}"`,
      {
        act: actHandle
      }
    );

    // Older MSE implementations update source buffers on a MediaSource.duration change
    await waitUntilReady(videoSourceBuffer);

    const durationInSeconds = 3.84 * 4;

    // buffer segments
    await appendBuffer(
      videoSourceBuffer,
      await fetchSegmentBuffer(videoSegmentTemplate.getInitSegment())
    );

    await appendAllBuffers(
      videoSourceBuffer,
      await fetchAllSegmentBuffers(
        videoSegmentTemplate.getMediaSegmentsForTimeRange([0, durationInSeconds])
      )
    );

    // test currentTime before playing
    const preEndedElementCurrentTime = videoElement.currentTime;
    actHandle.assert(
      preEndedElementCurrentTime === 0,
      `MediaElement.currentTime should be 0 (default state for currentTime). (got: ${preEndedElementCurrentTime})`
    );

    // play for 5s then pause
    const playHasEmitted = expectEvent(videoElement, PLAY);
    const playingHasEmitted = expectEvent(videoElement, PLAYING);
    play(videoElement);

    actHandle.assert(
      await playHasEmitted(),
      'MediaElement should emit a "play" event once media playback requested.'
    );

    actHandle.assert(
      await playingHasEmitted(),
      'MediaElement should emit a "playing" event once media playback begins.'
    );

    actHandle.log('MediaElement playing for 6 second.');

    const progressionWhilePlaying = await measurePlaybackProgressionOverTime(videoElement, 6);

    actHandle.assert(
      withinNumericTolerance(progressionWhilePlaying, 6, PLAYBACK_TIME_TOLERANCE_MS / 1000),
      `MediaElement.currentTime should have progressed by 6 (+/- ${PLAYBACK_TIME_TOLERANCE_MS / 1000}) seconds while playing. (got: ${progressionWhilePlaying} seconds)`
    );

    // pause
    const pauseHasEmitted = expectEvent(videoElement, PAUSE);
    pause(videoElement);

    actHandle.assert(
      await pauseHasEmitted(),
      'MediaElement should emit a "pause" event once media pause requested.'
    );

    // unbuffer from now until 3s behind
    const pauseTime = videoElement.currentTime;
    await removeBuffer(videoSourceBuffer, [pauseTime - 3, Number.POSITIVE_INFINITY]);

    // set live seekable range starting from 3s behind
    setLiveSeekableRange(mediaSource, [0, pauseTime - 3]);

    // play for 1 second
    const playHasEmittedAgain = expectEvent(videoElement, PLAY);
    const playingHasEmittedAgain = expectEvent(videoElement, PLAYING);
    play(videoElement);

    actHandle.assert(
      await playHasEmittedAgain(),
      'MediaElement should emit a "play" event once media playback requested.'
    );

    actHandle.assert(
      await playingHasEmittedAgain(),
      'MediaElement should emit a "playing" event once media playback begins.'
    );

    const secondProgressionWhilePlaying = await measurePlaybackProgressionOverTime(videoElement, 1);

    actHandle.assert(
      withinNumericRange(secondProgressionWhilePlaying, [pauseTime - 4, pauseTime + 3], 'all'),
      `MediaElement.currentTime should have skipped back by 3-4 second into the live seekable range. (got: ${secondProgressionWhilePlaying} seconds)`
    );
  }
);
