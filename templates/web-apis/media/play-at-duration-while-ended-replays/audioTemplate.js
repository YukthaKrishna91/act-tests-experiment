'use strict';

import { withinNumericRange } from '#lib/maths/withinNumericRange.js';
import { ENDED, PAUSE, PLAY, SEEKED, SEEKING, TIME_UPDATE } from '#lib/media-element/EventType.js';
import { play } from '#lib/media-element/play.js';
import { setCurrentTime } from '#lib/media-element/setCurrentTime.js';
import { SOURCE_ENDED, SOURCE_OPEN } from '#lib/media-source/EventType.js';
import { endOfStream } from '#lib/media-source/endOfStream.js';
import { setDuration } from '#lib/media-source/setDuration.js';
import { appendBuffer } from '#lib/source-buffer/appendBuffer.js';
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
import { SegmentSource } from '#lib/manifest/SegmentSource.js';

const DURATION_TOLERANCE = 0.1;

export const createTest = createSingleRepresentationAudioTemplate(
  'play at duration while ended replays',
  async (actHandle, { id, audioRepresentation }) => {
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

    const audioSource = new SegmentSource(audioSegmentTemplate);

    const bufferToPosix = Date.now() - 8_000; // avoid buffering final segment (of varying duration)

    const presentationTimeAtCurrentMoment =
      availability.getPresentationTimeFromPosixTime(bufferToPosix);
    const estimatedDurationInSeconds = presentationTimeAtCurrentMoment + 30;
    setDuration(mediaSource, estimatedDurationInSeconds);

    const [, expectedEndOfLastSegment] = audioSegmentTemplate.getTimeRangeContaining(
      presentationTimeAtCurrentMoment
    );
    const expectedDurationInSeconds = expectedEndOfLastSegment;

    // buffer segments
    await appendBuffer(audioSourceBuffer, await audioSource.fetchInitSegment());

    await appendBuffer(
      audioSourceBuffer,
      await audioSource.fetchBufferForTime(presentationTimeAtCurrentMoment)
    );

    // obtain source ended state
    const sourceEndedHasEmitted = expectEvent(mediaSource, SOURCE_ENDED);
    endOfStream(mediaSource);

    actHandle.assert(
      await sourceEndedHasEmitted(),
      'MediaSource should emit a "sourceended" event after endOfStream is called.'
    );

    const playHasEmitted = expectEvent(audioElement, PLAY);

    play(audioElement);

    actHandle.assert(
      await playHasEmitted(),
      `MediaElement should emit a "play" event once media playback is requested.`
    );

    // seek to end of buffered range
    const seekingHasEmitted = expectEvent(audioElement, SEEKING);
    const seekedHasEmitted = expectEvent(audioElement, SEEKED);
    const pauseHasEmitted = expectEvent(audioElement, PAUSE);
    const endedHasEmitted = expectEvent(audioElement, ENDED);

    // +1 to ensure we seek exactly to the end (media element should clamp it to seekable range)
    const targetTime = expectedDurationInSeconds + 1;
    setCurrentTime(audioElement, targetTime);

    actHandle.assert(
      await seekingHasEmitted(),
      `MediaElement should emit a "seeking" event after currentTime <- ${targetTime}.`
    );

    actHandle.assert(
      await seekedHasEmitted(),
      `MediaElement should emit a "seeked" event after currentTime <- ${targetTime}.`
    );

    actHandle.assert(
      await pauseHasEmitted(),
      'MediaElement should emit a "pause" event once playback reaches duration.'
    );

    actHandle.assert(
      await endedHasEmitted(),
      'MediaElement should emit an "ended" event once playback reaches duration.'
    );

    actHandle.assert(
      audioElement.ended,
      `MediaElement.ended should be true once an "ended" event is emitted. (got ${audioElement.ended})`
    );

    // assert pre-play state
    const prePlayElementCurrentTime = audioElement.currentTime;
    actHandle.assert(
      withinNumericTolerance(
        prePlayElementCurrentTime,
        expectedDurationInSeconds,
        DURATION_TOLERANCE
      ),
      `MediaElement.currentTime should be ${expectedDurationInSeconds} (+/- ${DURATION_TOLERANCE}) after seeking to duration. (got: ${prePlayElementCurrentTime})`
    );

    // play at duration
    const playAtEndHasEmitted = expectEvent(audioElement, PLAY);

    // assert automatic seek back to currentTime = 0
    const seekingToStartHasEmitted = expectEvent(audioElement, SEEKING);

    play(audioElement);

    actHandle.assert(
      await playAtEndHasEmitted(),
      'MediaElement should emit a "play" event after playing from end.'
    );

    actHandle.assert(
      await seekingToStartHasEmitted(),
      `MediaElement should emit a "seeking" event after playing from end.`
    );

    actHandle.assert(
      audioElement.currentTime === 0,
      `MediaElement.currentTime should equal 0 after playing from end. (got ${audioElement.currentTime})`
    );

    const audioBuffers = await audioSource.fetchBufferForTime(0);

    const timeupdateHasEmitted = expectEvent(audioElement, TIME_UPDATE);
    const seekedToStartHasEmitted = expectEvent(audioElement, SEEKED);

    await appendBuffer(audioSourceBuffer, audioBuffers);

    actHandle.assert(
      await timeupdateHasEmitted(),
      `MediaElement should emit a "timeupdate" event after playing from end.`
    );

    actHandle.assert(
      await seekedToStartHasEmitted(),
      `MediaElement should emit a "seeked" event after playing from end.`
    );

    // assert currentTime is now at the start
    const postPlayCurrentTime = audioElement.currentTime;
    actHandle.assert(
      withinNumericRange(postPlayCurrentTime, [0, 1], 'all'),
      `MediaElement.currentTime equals 0 after playback looped to start. (got: ${postPlayCurrentTime} )`
    );

    // play for 2s
    actHandle.log('MediaElement playing for 2 seconds.');

    // measure time since play restarted to 0
    const playbackProgressionSincePlay = await measurePlaybackProgressionOverTime(audioElement, 2);
    actHandle.assert(
      playbackProgressionSincePlay > 0,
      `MediaElement.currentTime has progressed after playback looped to start. (got: ${playbackProgressionSincePlay} seconds)`
    );
  }
);
