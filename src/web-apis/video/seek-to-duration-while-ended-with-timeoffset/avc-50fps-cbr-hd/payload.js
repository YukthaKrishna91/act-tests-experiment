import { test } from '#lib/multicheck-test/multicheck-test.js';
import { createTest } from '#templates/web-apis/media/seek-to-duration-while-ended-with-timeoffset/videoTemplate.js';
import { AVC_HD_50FPS_LIVE } from '#lib/media-representations.js';

const { name, func } = createTest({
  id: 'bbc-one-hd',
  videoRepresentation: AVC_HD_50FPS_LIVE.VIDEO.HIGHEST,
  audioRepresentation: AVC_HD_50FPS_LIVE.AUDIO.HIGHEST
});

test(name, async (actHandle) => func(actHandle));
