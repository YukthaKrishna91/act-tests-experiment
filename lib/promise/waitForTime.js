import { throwIfTimeToResolveInaccurate } from './throwIfTimeToResolveInaccurate.js';

export async function waitTimeout(value, millis = undefined) {
  return new Promise((resolve) =>
    setTimeout(() => {
      return resolve(typeof value === 'function' ? value() : value);
    }, millis)
  );
}

export async function waitForTime(millis, value = undefined, { verifyTimeToResolve = true } = {}) {
  return verifyTimeToResolve
    ? throwIfTimeToResolveInaccurate(() => waitTimeout(value, millis), millis, 500)
    : waitTimeout(value, millis);
}
