'use strict';

function loadSDK(callback) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function runTest() {
  act.start();

  var testTimeout = setTimeout(function () {
    act.fail('Test timed out after 5 seconds');
  }, 5000);

  try {
    var worker = new Worker(
      '/act/test/monorepo/latest/web-apis/webgl/webgl-context-worker/worker.js'
    );

    worker.onmessage = function (e) {
      var result = e.data;
      if (result.success) {
        act.success();
      } else {
        act.fail(result.message || 'The worker reported a failure.');
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
