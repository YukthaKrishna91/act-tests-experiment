/**
 * Creates a template you can use to create multiple variants of a single test, just like `test.each`.
 *
 * @see - `templates/` folder for examples.
 */
export function createTemplate(name, options, func) {
  // validate template name
  const nameType = typeof name;
  if (nameType !== 'string' || name.trim() === '')
    throw new TypeError(
      `Invalid template name provided. (got '${nameType === 'string' ? name : nameType}')`
    );

  // validate template options
  const optionsType = typeof options;
  if (optionsType !== 'object')
    throw new TypeError(`Invalid template options provided. (got '${optionsType}')`);
  if (!Array.isArray(options.values))
    throw new TypeError(
      `Invalid template options provided, values is not an array. (got '${typeof options.values}')`
    );

  // validate function
  const funcType = typeof func;
  if (funcType !== 'function')
    throw new TypeError(`Invalid template function provided. (got '${funcType}')`);

  return function createTest(suffix, values = {}) {
    // validate suffix
    const suffixType = typeof suffix;
    if (suffixType !== 'string' || suffix.trim() === '')
      throw new TypeError(
        `Invalid test name provided. (got '${suffixType === 'string' ? suffix : suffixType}')`
      );

    // validate values
    const errors = validateValues(values, options?.values || []);

    if (errors.length > 0) {
      throw new AggregateError(errors, `Invalid input values for template: '${name}'`);
    }

    const resolvedName = `${name} (${suffix})`;

    return {
      name: resolvedName,
      func: async (actHandle) => func(actHandle, values)
    };
  };
}

function validateValues(values, expectedValues) {
  const resolvedValues = values == null || typeof values !== 'object' ? {} : values;

  return [...generateErrors(resolvedValues, expectedValues)];
}

function* generateErrors(
  values,
  expectedValues,
  { _refs = new WeakSet(), _parentKeysDesc = [] } = {}
) {
  if (!Array.isArray(expectedValues)) {
    yield new TypeError(`No schema for object property '${_parentKeysDesc.join('.')}'`);
    return;
  }

  _refs.add(values);

  const keys = Object.keys(values);

  for (const key of keys) {
    const schema = expectedValues.find(({ key: someKey }) => key === someKey);

    const keyDotPath = [..._parentKeysDesc, key];

    // check key is in schema
    if (schema == null) {
      yield new TypeError(`Received unexpected property: ${keyDotPath.join('.')}`);
      continue;
    }

    const value = values[key];

    // check for non-primitives
    const type = typeof value;

    if (type === 'function') {
      yield new TypeError(
        `Received non-primitive value of property: ${keyDotPath.join('.')} (got '${type}')`
      );
    }

    // check sub-objects
    if (value && type === 'object') {
      if (_refs.has(value)) continue;

      yield* generateErrors(value, schema.values, { _parentKeysDesc: keyDotPath, _refs });
    }
  }

  _refs.delete(values);

  const requiredKeys = expectedValues.filter(({ required }) => required).map(({ key }) => key);

  for (const requiredKey of requiredKeys) {
    if (!keys.includes(requiredKey) || values[requiredKey] == null) {
      yield new TypeError(
        `Missing required property: ${[..._parentKeysDesc, requiredKey].join('.')}`
      );
    }
  }
}
