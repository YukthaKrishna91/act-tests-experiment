import { test } from '#lib/multicheck-test/multicheck-test.js';
import { createTest } from '#templates/web-apis/media/autoplay-false-playback-not-start/videoTemplate.js';
import { HEVC_FHD_50FPS_LIVE } from '#lib/media-representations.js';

const { name, func } = createTest({
  id: 'bbc-one-fhd',
  videoRepresentation: HEVC_FHD_50FPS_LIVE.VIDEO.HIGHEST,
  audioRepresentation: HEVC_FHD_50FPS_LIVE.AUDIO.HIGHEST
});

test(name, async (actHandle) => func(actHandle));
