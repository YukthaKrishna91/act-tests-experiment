import { test } from '#lib/multicheck-test/multicheck-test.js';
import { createTest } from '#templates/web-apis/media/time-to-playback-after-seeking-to-idr-frame/videoTemplate.js';
import { AVC_HD_50FPS_LIVE_CHUNKED } from '#lib/media-representations.js';

const { name, func } = createTest({
  id: 'rd-test-card-ll',
  videoRepresentation: AVC_HD_50FPS_LIVE_CHUNKED.VIDEO.HIGHEST,
  audioRepresentation: AVC_HD_50FPS_LIVE_CHUNKED.AUDIO.HIGHEST
});

test(name, async (actHandle) => func(actHandle));
