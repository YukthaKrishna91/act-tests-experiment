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
    act.fail('Test timed out after 5 seconds');
  }, 5000);

  try {
    const worker = new Worker(
      '/act/test/monorepo/latest/web-apis/web-workers/module-worker/worker.js',
      { type: 'module' }
    );

    worker.onmessage = function (e) {
      if (e.data === 'module-ready') {
        act.success();
      } else {
        act.fail('Received unexpected message from worker: ' + e.data);
      }
      clearTimeout(testTimeout);
      worker.terminate();
    };

    worker.onerror = function (err) {
      // Browsers that don't support module workers may throw a generic error
      act.fail(
        'Worker errored. This may indicate module workers are not supported. Error: ' +
          (err ? err.message : 'unknown error')
      );
      clearTimeout(testTimeout);
    };
  } catch (e) {
    // Browsers that don't support the 'type' option may throw a TypeError here
    act.fail(
      'Failed to construct worker. This may indicate module workers are not supported. Error: ' +
        (e ? e.message : 'unknown error')
    );
    clearTimeout(testTimeout);
  }
}

loadSDK(runTest);
