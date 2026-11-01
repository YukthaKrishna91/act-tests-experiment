import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { measureTimeToResolve } from './measureTimeToResolve.js';

describe('measureTimeToResolve', () => {
  it('measures time to resolve', async (t) => {
    const getMockTimestamp = t.mock.method(performance, 'now');

    getMockTimestamp.mock.mockImplementationOnce(() => 5000);

    const callback = async () => 'resolved';

    const measured = measureTimeToResolve(callback);

    getMockTimestamp.mock.mockImplementationOnce(() => 10000);

    const { status, value, millis } = await measured;

    assert.equal(status, 'fulfilled');
    assert.equal(millis, 5000);
    assert.equal(value, 'resolved');
  });

  it('measures time to reject', async (t) => {
    const getMockTimestamp = t.mock.method(performance, 'now');

    getMockTimestamp.mock.mockImplementationOnce(() => 2000);

    const callback = async () => {
      throw new Error('The operation failed');
    };

    const measured = measureTimeToResolve(callback);

    getMockTimestamp.mock.mockImplementationOnce(() => 6000);

    const { status, reason, millis } = await measured;

    assert.equal(status, 'rejected');
    assert.equal(millis, 4000);
    assert.deepEqual(reason, new Error('The operation failed'));
  });
});
