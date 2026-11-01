import { test } from '#lib/multicheck-test/multicheck-test.js';
import { createTest } from '#templates/web-apis/media/seeking-while-seeking/videoTemplate.js';
import { AVC_FHD_50FPS_ONDEMAND } from '#lib/media-representations.js';

const { name, func } = createTest({
  id: 'strictly-vbr',
  videoRepresentation: AVC_FHD_50FPS_ONDEMAND.VIDEO.HIGHEST,
  audioRepresentation: AVC_FHD_50FPS_ONDEMAND.AUDIO.HIGHEST
});

test(name, async (actHandle) => func(actHandle));
