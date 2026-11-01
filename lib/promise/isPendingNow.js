const pending = Symbol('pending');

export async function isPendingNow(promise) {
  try {
    const status = await Promise.race([promise, Promise.resolve(pending)]);

    return status === pending;
  } catch {
    return false;
  }
}
