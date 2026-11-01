import { test } from '#lib/multicheck-test/multicheck-test.js';
import { createTest } from '#templates/web-apis/media/play-at-duration-while-ended-replays/audioTemplate.js';
import { AAC_48KHZ } from '#lib/media-representations.js';

const { name, func } = createTest({
  id: 'in-our-time',
  audioRepresentation: AAC_48KHZ.AUDIO.HIGHEST
});

test(name, async (actHandle) => func(actHandle));
