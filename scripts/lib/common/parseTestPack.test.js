import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getTestPath } from './parseTestPack.js';

describe('getTestPath', () => {
  it('returns the path from a url', () => {
    assert.equal(getTestPath('/act/test/monorepo/latest/path/to/test/'), 'path/to/test');
  });

  it('returns the path from an object', () => {
    assert.equal(
      getTestPath({ test_url: '/act/test/monorepo/latest/path/to/test/' }),
      'path/to/test'
    );
  });
});
