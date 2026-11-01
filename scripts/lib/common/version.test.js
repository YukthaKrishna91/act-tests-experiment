import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isValidVersion } from './version.js';

function testEach(testCases, name, testTemplate) {
  if (!Array.isArray(testCases) || testCases.length === 0) {
    throw new TypeError(`No test cases provided. (got ${testCases})`);
  }

  if (typeof name !== 'string' && typeof name !== 'function') {
    throw new TypeError(`Name must be a string or function. (got ${name})`);
  }

  if (typeof testTemplate !== 'function') {
    throw new TypeError(`No test function provided. (got ${testTemplate})`);
  }

  testCases.forEach((params) => {
    const parameters = Array.isArray(params) ? params : [params];

    it(typeof name === 'string' ? name : name(...parameters), () => testTemplate(...parameters));
  });
}

describe('isValidVersion', () => {
  testEach(
    ['latest', 'v26.0.0-0', 'v26.0.0-12', 'branch=a-git-branch'],
    (string) => `accepts ${string} as a version`,
    (string) => {
      assert.equal(isValidVersion(string), true);
    }
  );

  testEach(
    ['stable', '26', 'v26', 'v26.0', 'v26.0.0', 'v26.0.0-a'],
    (string) => `rejects ${string} as a version`,
    (string) => {
      assert.equal(isValidVersion(string), false);
    }
  );
});
