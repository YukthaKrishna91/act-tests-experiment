import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { getError } from '../error/getError.js';
import { PromiseController } from './PromiseController.js';
import { raceTimeout } from './raceTimeout.js';

describe('raceTimeout', () => {
  it('returns the resolved value of the input promise', async () => {
    const result = await raceTimeout(Promise.resolve('resolved'));

    assert.equal(result, 'resolved');
  });

  it('throws the reason for rejection of the input promise', async () => {
    const result = await getError(() =>
      raceTimeout(Promise.reject(new Error('The operation failed.')))
    );

    assert.deepEqual(result, new Error('The operation failed.'));
  });

  it('throws a "TimeoutError" if the operation times out', async () => {
    mock.timers.enable({ apis: ['setTimeout'] });

    const controller = new PromiseController();

    const errored = getError(() =>
      raceTimeout(controller.promise, { timeoutInMillis: 1000, verifyTimeToResolve: false })
    );

    mock.timers.tick(1000);

    assert.deepEqual(await errored, new DOMException('The operation timed out', 'TimeoutError'));

    controller.resolve();
  });
});
