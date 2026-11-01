const pending = Symbol('pending');

export async function isFulfilledNow(promise) {
  try {
    const status = await Promise.race([promise, Promise.resolve(pending)]);

    return status !== pending;
  } catch {
    return false;
  }
}
