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
    const worker = new Worker('/act/test/monorepo/latest/web-apis/web-workers/fetch-api/worker.js');

    worker.onmessage = function (e) {
      const result = e.data;
      if (!result.fetchDefined) {
        act.fail('The fetch() function is not defined in the worker scope.');
      } else if (!result.fetchWorked) {
        act.fail('The fetch() function failed to retrieve a resource.');
      } else {
        act.success();
      }
      clearTimeout(testTimeout);
      worker.terminate();
    };

    worker.onerror = function (err) {
      act.fail('Worker errored: ' + (err ? err.message : 'unknown error'));
      clearTimeout(testTimeout);
    };
  } catch (e) {
    act.error('Failed to construct worker: ' + (e ? e.message : 'unknown error'));
    clearTimeout(testTimeout);
  }
}

loadSDK(runTest);
