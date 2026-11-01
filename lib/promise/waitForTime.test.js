import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isPendingNow } from './isPendingNow.js';
import { isFulfilled } from './isFulfilled.js';
import { waitForTime } from './waitForTime.js';

describe('waitForTime', () => {
  it('resolves on timeout', async (t) => {
    t.mock.timers.enable();

    const timedout = waitForTime(1000, undefined, { verifyTimeToResolve: false });

    assert.equal(await isPendingNow(timedout), true);

    t.mock.timers.tick(1000);

    assert.equal(await isFulfilled(timedout), true);
  });

  it('resolves with the input value', async (t) => {
    t.mock.timers.enable();

    const timedout = waitForTime(5000, 'timedout', { verifyTimeToResolve: false });

    t.mock.timers.tick(5000);

    assert.equal(await timedout, 'timedout');
  });

  it('resolves with return value of the input function', async (t) => {
    t.mock.timers.enable();

    const timedout = waitForTime(10000, async () => 'timedout', { verifyTimeToResolve: false });

    t.mock.timers.tick(10000);

    assert.equal(await timedout, 'timedout');
  });

  it('rejects if the timeout is too fast', async (t) => {
    t.mock.timers.enable();

    const getMockTimestamp = t.mock.method(performance, 'now');

    getMockTimestamp.mock.mockImplementationOnce(() => 0);

    const timedout = waitForTime(10000);

    getMockTimestamp.mock.mockImplementationOnce(() => 9000);

    t.mock.timers.tick(10000);

    await assert.rejects(timedout);
  });

  it('rejects if the timeout is too slow', async (t) => {
    t.mock.timers.enable();

    const getMockTimestamp = t.mock.method(performance, 'now');

    getMockTimestamp.mock.mockImplementationOnce(() => 0);

    const timedout = waitForTime(10000);

    getMockTimestamp.mock.mockImplementationOnce(() => 11000);

    t.mock.timers.tick(10000);

    await assert.rejects(timedout);
  });
});
