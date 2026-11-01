import { test } from '#lib/multicheck-test/multicheck-test.js';
import { createTest } from '#templates/web-apis/media/pausing-whilst-seeking-retains-paused-state/audioTemplate.js';
import { AAC_48KHZ } from '#lib/media-representations.js';

const { name, func } = createTest({
  id: 'radio-two',
  audioRepresentation: AAC_48KHZ.AUDIO.HIGHEST
});

test(name, async (actHandle) => func(actHandle));
