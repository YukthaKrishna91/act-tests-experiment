import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { measurePlaybackProgressionOverTime } from './measurePlaybackProgressionOverTime.js';

describe('measurePlaybackProgressionOverTime', () => {
  it('measures progression in .currentTime', async () => {
    mock.timers.enable({ apis: ['setTimeout'] });

    const mockMediaEl = { currentTime: 0 };

    const diffed = measurePlaybackProgressionOverTime(mockMediaEl, 3, {
      verifyTimeToResolve: false
    });

    mockMediaEl.currentTime = 3;

    mock.timers.tick(3000);

    assert.equal(await diffed, 3);
  });
});
