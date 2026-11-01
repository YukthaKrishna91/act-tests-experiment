/**
 * Get the result of all steps in an async iterable.
 *
 * @param {AsyncIterable} iterable
 */
export async function consumeAsyncIterable(iterable) {
  const results = [];

  for await (const result of iterable) {
    results.push(result);
  }

  return results;
}
