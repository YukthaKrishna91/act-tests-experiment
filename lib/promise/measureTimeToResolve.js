export async function measureTimeToResolve(func) {
  const start = performance.now();

  try {
    const value = await func();

    return {
      value,
      status: 'fulfilled',
      millis: performance.now() - start
    };
  } catch (reason) {
    return {
      reason,
      status: 'rejected',
      millis: performance.now() - start
    };
  }
}
