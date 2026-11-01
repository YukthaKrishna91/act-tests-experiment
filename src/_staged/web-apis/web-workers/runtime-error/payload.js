'use strict';

function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function runTest() {
  act.start();

  const testTimeout = setTimeout(() => {
    act.fail('Test timed out: The onerror event was not fired.');
  }, 5000);

  try {
    const worker = new Worker(
      '/act/test/monorepo/latest/web-apis/web-workers/runtime-error/worker.js'
    );

    worker.onmessage = function () {
      act.fail('onmessage was called, but onerror was expected.');
      clearTimeout(testTimeout);
      worker.terminate();
    };

    worker.onerror = function (err) {
      // We expect an error, so this is the success path.
      if (err && err.message && err.message.includes('worker-test-error')) {
        act.success();
      } else {
        act.fail(
          'onerror was triggered, but the error message was not as expected. Got: ' +
            (err ? err.message : 'undefined')
        );
      }
      err.preventDefault(); // Prevents the error from being logged to the console as unhandled.
      clearTimeout(testTimeout);
    };
  } catch (e) {
    act.error('Failed to construct worker: ' + (e ? e.message : 'unknown error'));
    clearTimeout(testTimeout);
  }
}

loadSDK(runTest);
