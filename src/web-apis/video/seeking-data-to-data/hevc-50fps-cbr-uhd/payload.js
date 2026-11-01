import { test } from '#lib/multicheck-test/multicheck-test.js';
import { createTest } from '#templates/web-apis/media/seeking-data-to-data/videoTemplate.js';
import { HEVC_UHD_50FPS_LIVE } from '#lib/media-representations.js';

const { name, func } = createTest({
  id: 'journalism-uhd-simulcast',
  videoRepresentation: HEVC_UHD_50FPS_LIVE.VIDEO.HIGHEST,
  audioRepresentation: HEVC_UHD_50FPS_LIVE.AUDIO.HIGHEST
});

test(name, async (actHandle) => func(actHandle));
