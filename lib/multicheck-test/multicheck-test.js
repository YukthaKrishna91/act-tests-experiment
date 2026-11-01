import act from 'act-sdk';

import { logParameters } from '../console/logParameters.js';

function formatAssertion(assertion, message) {
  return `${assertion ? 'PASS:' : 'FAIL:'} ${message}`;
}

/**
 * Make multiple assertions in a single ACT test using the `actHandle`.
 *
 * @see - web-apis/audio and web-apis/video: Used primarily in media playback ACT tests.
 *
 * @param {string} name
 * @param {(actHandle: any) => Promise<void>} func
 * @returns {Promise<void>}
 *
 * @example
 * // First assertion always fails
 * // Second assertion is always executed
 * test('simple addition', (actHandle) => {
 *   actHandle.assert(1 + 1 === 3, '1 + 1 should equal 3 because 1, +, 1, is three things.')
 *   actHandle.assert(1 + 1 === 2, 'Joking aside, 1 + 1 should equal 2');
 * })
 */
export async function test(name, func) {
  const checks = [];

  const log = logParameters((...parts) => act.log(parts.join(' ')));

  function assert(assertion, message) {
    log(formatAssertion(assertion, message));
    checks.push([assertion, message]);
  }

  const actHandle = {
    assert,
    // eslint-disable-next-line no-restricted-syntax
    fail: (reason) => assert(false, reason),
    // wrapping ACT:
    log,
    ask: (message) => act.ask(message),
    fetchDeviceConfig: (environment) =>
      new Promise((resolve, reject) =>
        act.deviceConfig.getDeviceConfig(
          (config) =>
            config == null ? reject(new Error('Failed to fetch config')) : resolve(config),
          environment
        )
      ),
    render: (element) => new Promise((resolve) => act.render(element, resolve))
  };

  try {
    act.start();
    actHandle.log(`${name} started`);

    await func(actHandle);
  } catch (error) {
    console.error(error);

    const name = (error && error.name) || 'Error';
    const message = (error && error.message) || error || 'Something went wrong!';

    return act.error(`[${name}] ${message}`);
  }

  const failedChecks = checks.filter(([assertion]) => !assertion);

  const allChecksPassed = failedChecks.length === 0;

  if (checks.length > 0) {
    actHandle.log(`${failedChecks.length} checks failed. ${checks.length} total:`);
  }

  for (const [assertion, message] of checks) {
    actHandle.log(formatAssertion(assertion, message));
  }

  return allChecksPassed
    ? act.success()
    : act.fail(
        JSON.stringify({
          failures: checks.filter(([assertion]) => !assertion).map(([, message]) => message)
        })
      );
}
