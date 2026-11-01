import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { getError } from '../error/getError.js';
import { createTemplate } from './template.js';

describe('createTemplate', () => {
  it('creates a test template', async () => {
    const createTest = createTemplate(
      'check type',
      { values: [{ key: 'type' }] },
      (actHandle, values) => actHandle.assert(values)
    );

    const { name: checkStringName, func: checkString } = createTest('string', { type: 'string' });

    const mockActHandle = { assert: mock.fn() };

    await checkString(mockActHandle);

    assert.equal(checkStringName, 'check type (string)');
    assert.deepEqual(mockActHandle.assert.mock.calls[0].arguments, [{ type: 'string' }]);

    const { name: checkNumberName, func: checkNumber } = createTest('number', { type: 'number' });

    await checkNumber(mockActHandle);

    assert.equal(checkNumberName, 'check type (number)');
    assert.deepEqual(mockActHandle.assert.mock.calls[1].arguments, [{ type: 'number' }]);
  });

  it('ensures templates validate input', async () => {
    const noNameError = await getError(() => createTemplate());
    assert.deepEqual(
      noNameError,
      new TypeError(`Invalid template name provided. (got 'undefined')`)
    );

    const noOptionsError = await getError(() => createTemplate('check type'));
    assert.deepEqual(
      noOptionsError,
      new TypeError(`Invalid template options provided. (got 'undefined')`)
    );

    const noOptionsValuesError = await getError(() => createTemplate('check type', {}));
    assert.deepEqual(
      noOptionsValuesError,
      new TypeError(`Invalid template options provided, values is not an array. (got 'undefined')`)
    );

    const noTestFunctionError = await getError(() => createTemplate('check type', { values: [] }));
    assert.deepEqual(
      noTestFunctionError,
      new TypeError(`Invalid template function provided. (got 'undefined')`)
    );
  });

  it("accepts a test that doesn't provide a value that isn't required", async () => {
    const createTest = createTemplate('check', { values: [{ key: 'type' }] }, (actHandle, values) =>
      actHandle.assert(values)
    );

    const { name, func: check } = createTest('nothing');

    const mockActHandle = { assert: mock.fn() };

    await check(mockActHandle);

    assert.equal(name, 'check (nothing)');
    assert.deepEqual(mockActHandle.assert.mock.calls[0].arguments, [{}]);
  });

  it("throws if a test's name isn't provided", async () => {
    const createTest = createTemplate('check', { values: [{ key: 'type' }] }, mock.fn());

    const error = await getError(() => createTest());

    assert.deepEqual(error, new TypeError(`Invalid test name provided. (got 'undefined')`));
  });

  it('throws if a required value is not provided', async () => {
    const createTest = createTemplate(
      'check',
      {
        values: [
          { key: 'adjective', required: true },
          { key: 'noun', required: true }
        ]
      },
      mock.fn()
    );

    const error = await getError(() => createTest('it fails', { noun: 'World' }));

    assert.equal(error.name, 'AggregateError');
    assert.deepEqual(error.errors, [new TypeError('Missing required property: adjective')]);
  });

  it("accepts a test that doesn't provide a value that isn't required although nested values are required", async () => {
    const createTest = createTemplate(
      'check',
      {
        values: [
          {
            key: 'person',
            required: false,
            values: [
              { key: 'firstName', required: true },
              { key: 'lastName', required: true }
            ]
          }
        ]
      },
      (actHandle, values) => actHandle.assert(values)
    );

    const { name, func: check } = createTest('nothing');

    const mockActHandle = { assert: mock.fn() };

    await check(mockActHandle);

    assert.equal(name, 'check (nothing)');
    assert.deepEqual(mockActHandle.assert.mock.calls[0].arguments, [{}]);
  });

  it('throws if a _nested_ required value is not provided', async () => {
    const createTest = createTemplate(
      'check',
      {
        values: [
          {
            key: 'person',
            required: true,
            values: [
              { key: 'firstName', required: true },
              { key: 'lastName', required: true }
            ]
          }
        ]
      },
      mock.fn()
    );

    const error = await getError(() =>
      createTest('it fails', {
        person: {
          firstName: 'Person'
        }
      })
    );

    assert.equal(error.name, 'AggregateError');
    assert.deepEqual(error.errors, [new TypeError('Missing required property: person.lastName')]);
  });

  it('throws if a _deeply nested_ required value is not provided', async () => {
    const createTest = createTemplate(
      'check',
      {
        values: [
          {
            key: 'a',
            required: true,
            values: [{ key: 'b', required: true, values: [{ key: 'c', required: true }] }]
          }
        ]
      },
      mock.fn()
    );

    const error = await getError(() => createTest('it fails', { a: { b: {} } }));

    assert.equal(error.name, 'AggregateError');
    assert.deepEqual(error.errors, [new TypeError('Missing required property: a.b.c')]);
  });

  it('works without input values when none are required', async () => {
    const createTest = createTemplate('check', { values: [{ key: 'type' }] }, (actHandle, values) =>
      actHandle.assert(values)
    );

    const { name: checkStringName, func: checkString } = createTest('it runs');

    const mockActHandle = { assert: mock.fn() };

    await checkString(mockActHandle);

    assert.equal(checkStringName, 'check (it runs)');
    assert.deepEqual(mockActHandle.assert.mock.calls[0].arguments, [{}]);
  });

  it('throws if an input value is a function type', async () => {
    const createTest = createTemplate('check', { values: [{ key: 'adjective' }] }, mock.fn());

    const error = await getError(() =>
      createTest('it fails', {
        adjective: () => 'big'
      })
    );

    assert.equal(error.name, 'AggregateError');
    assert.deepEqual(error.errors, [
      new TypeError("Received non-primitive value of property: adjective (got 'function')")
    ]);
  });

  it('protects against circular references', async () => {
    const createTest = createTemplate(
      'check',
      {
        values: [
          { key: 'animal', values: [{ key: 'name' }, { key: 'rootRef' }, { key: 'animalRef' }] }
        ]
      },
      mock.fn()
    );

    const values = {
      animal: {
        name: 'frog',
        rootRef: null,
        animalRef: null
      }
    };
    values.animal.rootRef = values;
    values.animal.animalRef = values.animal;

    const { name: checkStringName, func: checkString } = createTest('it runs', values);

    const mockActHandle = { assert: mock.fn() };

    await checkString(mockActHandle);

    assert.equal(checkStringName, 'check (it runs)');
  });
});
