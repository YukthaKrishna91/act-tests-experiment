export function* mergeIterables(...iterables) {
  if (iterables.length === 0) {
    return;
  }

  const iterators = iterables.map((iterable) => iterable[Symbol.iterator]());

  while (true) {
    const values = [];

    let doneSoFar = 0;

    for (const iterator of iterators) {
      const { done, value } = iterator.next();

      if (done) {
        doneSoFar += 1;
      }

      values.push(value);
    }

    if (doneSoFar === iterators.length) {
      return values;
    }

    if (doneSoFar > 0) {
      throw new Error(
        `Iterables are different lengths. (got ${doneSoFar} out of ${iterators.length} done)`
      );
    }

    yield values;
  }
}
