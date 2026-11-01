import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { isPendingNow } from './isPendingNow.js';

describe('isPendingNow', () => {
  it('returns false if promise resolved', async () => {
    assert.equal(await isPendingNow(Promise.resolve()), false);
  });

  it('returns false if promise rejected', async () => {
    assert.equal(await isPendingNow(Promise.reject()), false);
  });

  it('returns true if promise pending', async () => {
    const stub = mock.fn();

    assert.equal(await isPendingNow(new Promise(() => stub())), true);
  });
});
