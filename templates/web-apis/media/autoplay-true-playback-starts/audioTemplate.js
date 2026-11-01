'use strict';

import { PLAY, SEEKED, SEEKING, TIME_UPDATE } from '#lib/media-element/EventType.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { appendAllBuffers } from '#lib/source-buffer/appendAllBuffers.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
import { fetchAllSegmentBuffers } from '#lib/streaming-segments/fetchAllSegmentBuffers.js';
import { fetchSegmentBuffer } from '#lib/streaming-segments/fetchSegmentBuffer.js';
import { waitUntilReady } from '#lib/source-buffer/waitUntilReady.js';
import { createSeekWindowFromManifest } from '#lib/manifest/createSeekWindowFromManifest.js';
import { createSourceBuffer } from '#lib/source-buffer/createSourceBuffer.js';
import { createSegmentTemplateFromManifest } from '#lib/manifest/createSegmentTemplateFromManifest.js';
import { fetchManifest } from '#lib/asset/fetchManifest.js';
import { setupMediaElement } from '#lib/media-element/setupMediaElement.js';
import { setupMediaSource } from '#lib/media-source/setupMediaSource.js';
import { expectEvent } from '#lib/event-target/expectEvent.js';
import { measurePlaybackProgressionOverTime } from '#lib/media-element/measurePlaybackProgressionOverTime.js';
import { createSingleRepresentationAudioTemplate } from '#lib/multicheck-test/singleRepresentationAudioTemplate.js';
import { withinNumericTolerance } from '#lib/maths/withinNumericTolerance.js';

const SEEK_TIME_PLAYBACK_TOLERANCE = 0.1;

export const createTest = createSingleRepresentationAudioTemplate(
  'autoplay starts playback',
  async (actHandle, { id, audioRepresentation }) => {
    const mediaSource = setupMediaSource(new MediaSource(), { act: actHandle });
    const sourceOpenHasEmitted = expectEvent(mediaSource, SOURCE_OPEN);
    const audioElement = setupMediaElement(
      document.createElement('audio'),
      URL.createObjectURL(mediaSource),
      { act: actHandle }
    );

    audioElement.autoplay = true;

    actHandle.assert(
      audioElement.autoplay === true,
      `MediaElement.autoplay should equal true. (got: ${audioElement.autoplay})`
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

    const audioSourceBuffer = createSourceBuffer(
      mediaSource,
      `audio/mp4; codecs="${audioRepresentation.codecs}"`,
      {
        act: actHandle
      }
    );

    const availability = createSeekWindowFromManifest(manifestDocument);

    // Older MSE implementations update source buffers on a MediaSource.duration change
    await waitUntilReady(audioSourceBuffer);

    const bufferToPosix = Date.now() - 8_000; // avoid buffering final segment (of varying duration)
    const bufferFromPosix = Date.now() - 10_000;

    const presentationTimeAtCurrentMoment =
      availability.getPresentationTimeFromPosixTime(bufferToPosix);
    const estimatedDurationInSeconds = presentationTimeAtCurrentMoment + 30;
    setDuration(mediaSource, estimatedDurationInSeconds);

    // buffer segments
    await appendBuffer(
      audioSourceBuffer,
      await fetchSegmentBuffer(audioSegmentTemplate.getInitSegment())
    );

    await appendAllBuffers(
      audioSourceBuffer,
      await fetchAllSegmentBuffers(
        audioSegmentTemplate.getMediaSegments(
          availability.getTimeRangeFromPosixRange([bufferFromPosix, bufferToPosix])
        )
      )
    );

    // seek to start of buffered range
    const seekingHasEmitted = expectEvent(audioElement, SEEKING);
    const timeUpdateHasEmitted = expectEvent(audioElement, TIME_UPDATE);
    const seekedHasEmitted = expectEvent(audioElement, SEEKED);
    const playHasEmitted = expectEvent(audioElement, PLAY);

    const [startOfBufferedRange] = audioSegmentTemplate.getSegmentRange(
      availability.getPresentationTimeFromPosixTime(bufferFromPosix)
    );
    const targetTime = startOfBufferedRange;
    setCurrentTime(audioElement, startOfBufferedRange);

    actHandle.assert(
      await seekingHasEmitted(),
      `MediaElement should emit a "seeking" event after currentTime <- ${startOfBufferedRange}.`
    );

    actHandle.assert(
      await timeUpdateHasEmitted(),
      `MediaElement should emit a "timeupdate" event after currentTime <- ${startOfBufferedRange}.`
    );

    actHandle.assert(
      await seekedHasEmitted(),
      `MediaElement should emit a "seeked" event after currentTime <- ${startOfBufferedRange}.`
    );

    const postSeekCurrentTime = audioElement.currentTime;
    actHandle.assert(
      withinNumericTolerance(postSeekCurrentTime, targetTime, SEEK_TIME_PLAYBACK_TOLERANCE),
      `MediaElement.currentTime equals ${targetTime} (+/- ${SEEK_TIME_PLAYBACK_TOLERANCE}) after currentTime <- ${targetTime}. (got: ${postSeekCurrentTime})`
    );

    actHandle.assert(
      await playHasEmitted(),
      'MediaElement should emit a "play" after seeking to start of buffered range.'
    );

    const progressedTime = await measurePlaybackProgressionOverTime(audioElement, 2);

    actHandle.assert(
      progressedTime > 0,
      `MediaElement.currentTime has progressed after seeking to start of buffered range. (got: ${progressedTime} seconds)`
    );
  }
);
