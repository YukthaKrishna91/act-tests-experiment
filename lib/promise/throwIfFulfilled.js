export async function throwIfFulfilled(promise, reason) {
  await promise;
  throw reason;
}
