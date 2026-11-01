import { test } from '#lib/multicheck-test/multicheck-test.js';
import { createTest } from '#templates/web-apis/media/seek-from-duration-to-start-while-ended/audioTemplate.js';
import { AAC_48KHZ } from '#lib/media-representations.js';

const { name, func } = createTest({
  id: 'in-our-time',
  audioRepresentation: AAC_48KHZ.AUDIO.HIGHEST
});

test(name, async (actHandle) => func(actHandle));
