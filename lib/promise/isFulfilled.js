export async function isFulfilled(promise) {
  try {
    await promise;
    return true;
  } catch {
    return false;
  }
}
