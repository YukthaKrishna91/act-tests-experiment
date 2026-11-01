'use strict';

import { PLAY, SEEKED, SEEKING, TIME_UPDATE } from '#lib/media-element/EventType.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { fetchAllSegmentBuffers } from '#lib/streaming-segments/fetchAllSegmentBuffers.js';
import { fetchSegmentBuffer } from '#lib/streaming-segments/fetchSegmentBuffer.js';
import { createSingleRepresentationVideoTemplate } from '#lib/multicheck-test/singleRepresentationVideoTemplate.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { measurePlaybackProgressionOverTime } from '#lib/media-element/measurePlaybackProgressionOverTime.js';
import { withinNumericTolerance } from '#lib/maths/withinNumericTolerance.js';

const SEEK_TIME_PLAYBACK_TOLERANCE = 0.1;

export const createTest = createSingleRepresentationVideoTemplate(
  'autoplay starts playback',
  async (actHandle, { id, videoRepresentation, audioRepresentation }) => {
    const mediaSource = setupMediaSource(new MediaSource(), { act: actHandle });
    const sourceOpenHasEmitted = expectEvent(mediaSource, SOURCE_OPEN);
    const videoElement = setupMediaElement(
      document.createElement('video'),
      URL.createObjectURL(mediaSource),
      { act: actHandle }
    );

    videoElement.autoplay = true;

    actHandle.assert(
      videoElement.autoplay === true,
      `MediaElement.autoplay should equal true. (got: ${videoElement.autoplay})`
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
    const bufferFromPosix = Date.now() - 6_000;

    const presentationTimeAtCurrentMoment =
      availability.getPresentationTimeFromPosixTime(bufferToPosix);
    const estimatedDurationInSeconds = presentationTimeAtCurrentMoment + 30;
    setDuration(mediaSource, estimatedDurationInSeconds);

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

    // seek to start of buffered range
    const seekingHasEmitted = expectEvent(videoElement, SEEKING);
    const timeUpdateHasEmitted = expectEvent(videoElement, TIME_UPDATE);
    const seekedHasEmitted = expectEvent(videoElement, SEEKED);
    const playHasEmitted = expectEvent(videoElement, PLAY);

    const [startOfBufferedRange] = videoSegmentTemplate.getSegmentRange(
      availability.getPresentationTimeFromPosixTime(bufferFromPosix)
    );
    const targetTime = startOfBufferedRange;
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

    const postSeekCurrentTime = videoElement.currentTime;
    actHandle.assert(
      withinNumericTolerance(postSeekCurrentTime, targetTime, SEEK_TIME_PLAYBACK_TOLERANCE),
      `MediaElement.currentTime equals ${targetTime} (+/- ${SEEK_TIME_PLAYBACK_TOLERANCE}) after currentTime <- ${targetTime}. (got: ${postSeekCurrentTime})`
    );

    actHandle.assert(
      await playHasEmitted(),
      'MediaElement should emit a "play" after seeking to start of buffered range.'
    );

    actHandle.log('MediaElement playing for 2 seconds.');

    const progressedTime = await measurePlaybackProgressionOverTime(videoElement, 2);

    actHandle.assert(
      progressedTime > 0,
      `MediaElement.currentTime has progressed after seeking to start of buffered range. (got: ${progressedTime} seconds)`
    );
  }
);
