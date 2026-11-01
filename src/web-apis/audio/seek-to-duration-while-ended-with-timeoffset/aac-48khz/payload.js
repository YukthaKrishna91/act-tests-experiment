import { test } from '#lib/multicheck-test/multicheck-test.js';
import { createTest } from '#templates/web-apis/media/seek-to-duration-while-ended-with-timeoffset/audioTemplate.js';
import { AAC_48KHZ } from '#lib/media-representations.js';

const { name, func } = createTest({
  id: 'radio-two',
  audioRepresentation: AAC_48KHZ.AUDIO.HIGHEST
});

test(name, async (actHandle) => func(actHandle));
