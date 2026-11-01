import { test } from '#lib/multicheck-test/multicheck-test.js';
import { createTest } from '#templates/web-apis/media/seeking-data-to-no-data/videoTemplate.js';
import { HEVC_UHD_25FPS_ONDEMAND } from '#lib/media-representations.js';

const { name, func } = createTest({
  id: 'new-bitmovin-vod-uhd-looped-clip',
  videoRepresentation: HEVC_UHD_25FPS_ONDEMAND.VIDEO.HIGHEST,
  audioRepresentation: HEVC_UHD_25FPS_ONDEMAND.AUDIO.HIGHEST
});

test(name, async (actHandle) => func(actHandle));
