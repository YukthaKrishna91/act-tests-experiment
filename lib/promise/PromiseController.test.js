import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getError } from '../error/getError.js';
import { isPendingNow } from './isPendingNow.js';
import { PromiseController } from './PromiseController.js';
import { isFulfilled } from './isFulfilled.js';

describe('PromiseController', () => {
  it('resolves the child promise', async () => {
    const controller = new PromiseController();

    assert.equal(await isPendingNow(controller.promise), true);

    controller.resolve('resolved');

    assert.equal(await isFulfilled(controller.promise), true);
    assert.equal(await controller.promise, 'resolved');
  });

  it('rejects the child promise', async () => {
    const controller = new PromiseController();

    assert.equal(await isPendingNow(controller.promise), true);

    controller.reject(new Error('The operation failed'));

    assert.equal(await isFulfilled(controller.promise), false);
    assert.deepEqual(await getError(() => controller.promise), new Error('The operation failed'));
  });
});
