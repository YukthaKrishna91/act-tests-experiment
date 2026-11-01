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
      '/act/test/monorepo/latest/web-apis/web-workers/request-animation-frame/worker.js'
    );

    worker.onmessage = function (e) {
      clearTimeout(testTimeout);
      worker.terminate();

      const result = e.data;
      if (result.success) {
        act.success();
      } else {
        act.fail(result.message || 'The worker reported a failure.');
      }
    };

    worker.onerror = function (err) {
      clearTimeout(testTimeout);
      act.fail('Worker errored: ' + (err ? err.message : 'unknown error'));
    };
  } catch (e) {
    clearTimeout(testTimeout);
    act.error('Failed to construct worker: ' + (e ? e.message : 'unknown error'));
  }
}

loadSDK(runTest);
