import { test } from '#lib/multicheck-test/multicheck-test.js';
import { createTest } from '#templates/web-apis/media/seek-from-duration-to-start-while-ended/videoTemplate.js';
import { HEVC_UHD_50FPS_ONDEMAND } from '#lib/media-representations.js';

const { name, func } = createTest({
  id: 'bitmovin-vod-uhd-50fps',
  videoRepresentation: HEVC_UHD_50FPS_ONDEMAND.VIDEO.HIGHEST,
  audioRepresentation: HEVC_UHD_50FPS_ONDEMAND.AUDIO.HIGHEST
});

test(name, async (actHandle) => func(actHandle));
