'use strict';

import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { trackEvent } from '#lib/event-target/trackEvent.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import {
  PAUSE,
  PLAY,
  PLAYING,
  SEEKED,
  SEEKING,
  TIME_UPDATE
} from '#lib/media-element/EventType.js';
import { measurePlaybackProgressionOverTime } from '#lib/media-element/measurePlaybackProgressionOverTime.js';
import { pause } from '#lib/media-element/pause.js';
import { play } from '#lib/media-element/play.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { createSingleRepresentationVideoTemplate } from '#lib/multicheck-test/singleRepresentationVideoTemplate.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';
import { fetchAllSegmentBuffers } from '#lib/streaming-segments/fetchAllSegmentBuffers.js';
import { fetchSegmentBuffer } from '#lib/streaming-segments/fetchSegmentBuffer.js';

export const createTest = createSingleRepresentationVideoTemplate(
  'pausing',
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

    const availability = createSeekWindowFromManifest(manifestDocument);

    // Older MSE implementations update source buffers on a MediaSource.duration change
    await Promise.all([waitUntilReady(videoSourceBuffer), waitUntilReady(audioSourceBuffer)]);

    const bufferToPosix = Date.now() - 4_000; // avoid buffering final segment (of varying duration)
    const bufferFromPosix = Date.now() - 9_000;

    // buffer segments
    await Promise.all([
      appendBuffer(
        audioSourceBuffer,
        await fetchSegmentBuffer(audioSegmentTemplate.getInitSegment())
      ),
      appendBuffer(
        videoSourceBuffer,
        await fetchSegmentBuffer(videoSegmentTemplate.getInitSegment())
      )
    ]);

    await Promise.all([
      appendAllBuffers(
        audioSourceBuffer,
        await fetchAllSegmentBuffers(
          audioSegmentTemplate.getMediaSegmentsForTimeRange(
            availability.getTimeRangeFromPosixRange([bufferFromPosix, bufferToPosix])
          )
        )
      ),
      appendAllBuffers(
        videoSourceBuffer,
        await fetchAllSegmentBuffers(
          videoSegmentTemplate.getMediaSegmentsForTimeRange(
            availability.getTimeRangeFromPosixRange([bufferFromPosix, bufferToPosix])
          )
        )
      )
    ]);

    // test currentTime before seeking
    const preEndedElementCurrentTime = videoElement.currentTime;
    actHandle.assert(
      preEndedElementCurrentTime === 0,
      `MediaElement.currentTime should be 0 (default state for currentTime). (got: ${preEndedElementCurrentTime})`
    );

    // seek to start of buffered range
    const seekingHasEmitted = expectEvent(videoElement, SEEKING);
    const timeUpdateHasEmitted = expectEvent(videoElement, TIME_UPDATE);
    const seekedHasEmitted = expectEvent(videoElement, SEEKED);

    const [targetTime] = videoSegmentTemplate.getTimeRangeContaining(
      availability.getPresentationTimeFromPosixTime(bufferFromPosix)
    );
    setCurrentTime(videoElement, targetTime);

    actHandle.assert(
      await seekingHasEmitted(),
      `MediaElement should emit a "seeking" event after currentTime <- ${targetTime}.`
    );

    actHandle.assert(
      await timeUpdateHasEmitted(),
      `MediaElement should emit a "timeupdate" event after currentTime <- ${targetTime}.`
    );

    actHandle.assert(
      await seekedHasEmitted(),
      `MediaElement should emit a "seeked" event after currentTime <- ${targetTime}.`
    );

    // play for 3s & track timeupdate events
    const [timeupdateResults, stopTrackingTimeupdates] = trackEvent(videoElement, 'timeupdate');

    const playHasEmitted = expectEvent(videoElement, PLAY);
    const playingHasEmitted = expectEvent(videoElement, PLAYING);
    const postPlayTimeUpdateHasEmitted = expectEvent(videoElement, TIME_UPDATE);
    play(videoElement);

    actHandle.assert(
      await playHasEmitted(),
      'MediaElement should emit a "play" event once media playback requested.'
    );

    actHandle.assert(
      await playingHasEmitted(),
      'MediaElement should emit a "playing" event once media playback requested.'
    );

    actHandle.assert(
      await postPlayTimeUpdateHasEmitted(),
      `MediaElement should emit a "timeupdate" event once media playback begins.`
    );

    // pause
    const pauseHasEmitted = expectEvent(videoElement, PAUSE);
    const postPauseTimeUpdateHasEmitted = expectEvent(videoElement, TIME_UPDATE);
    pause(videoElement);

    actHandle.assert(
      await postPauseTimeUpdateHasEmitted(),
      `MediaElement should emit a "timeupdate" event once media pause requested.`
    );

    actHandle.assert(
      await pauseHasEmitted(),
      'MediaElement should emit a "pause" event once media pause requested.'
    );

    const pauseTimestamp = Date.now();

    actHandle.log('MediaElement pausing for 3 seconds.');

    // remain paused for 3s
    const progressionWhilePaused = await measurePlaybackProgressionOverTime(videoElement, 3);
    stopTrackingTimeupdates();

    actHandle.assert(
      progressionWhilePaused === 0,
      `MediaElement.currentTime should have not progressed while paused. (got: ${progressionWhilePaused} seconds)`
    );

    const timeupdatesAfterPause = timeupdateResults.filter(
      ({ timestamp }) => timestamp > pauseTimestamp
    );

    actHandle.assert(
      timeupdatesAfterPause.length === 0,
      `MediaElement should not emit "timeupdate" events while paused. (got: ${timeupdatesAfterPause.length} events)`
    );
  }
);
