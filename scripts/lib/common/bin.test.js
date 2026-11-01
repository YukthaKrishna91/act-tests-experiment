import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { bin } from './bin.js';

describe('bin', () => {
  it('groups an iterable by the function', () => {
    assert.deepEqual(
      bin([0, 1, 2, 3, 4, 5], (number) => (number % 2 === 0 ? 'even' : 'odd')),
      new Map([
        ['even', [0, 2, 4]],
        ['odd', [1, 3, 5]]
      ])
    );
  });

  it('defaults to undefined', () => {
    const symbolsByCase = bin(['A', 'b', '3'], (symbol) => {
      const isUpper = symbol === symbol.toUpperCase();
      const isLower = symbol === symbol.toLowerCase();

      if (isUpper && !isLower) {
        return 'upper';
      }

      if (isLower && !isUpper) {
        return 'lower';
      }
    });

    assert.deepEqual(symbolsByCase.get('upper'), ['A']);
    assert.deepEqual(symbolsByCase.get('lower'), ['b']);
    assert.deepEqual(symbolsByCase.get(undefined), ['3']);
  });
});
