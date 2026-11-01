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

  const WORKER_COUNT = 2;
  const workers = [];
  const results = [];
  let completedCount = 0;

  const testTimeout = setTimeout(() => {
    workers.forEach((w) => w.terminate());
    act.fail(
      'Test timed out after 15 seconds. Only ' +
        completedCount +
        '/' +
        WORKER_COUNT +
        ' workers completed.'
    );
  }, 15000);

  function checkAllComplete() {
    if (completedCount === WORKER_COUNT) {
      clearTimeout(testTimeout);
      workers.forEach((w) => w.terminate());

      const allSuccessful = results.every((r) => r.success);
      if (allSuccessful) {
        act.success();
      } else {
        const failures = results.filter((r) => !r.success).map((r) => r.message);
        act.fail('Some workers failed: ' + failures.join('; '));
      }
    }
  }

  try {
    for (let i = 0; i < WORKER_COUNT; i++) {
      const worker = new Worker(
        '/act/test/monorepo/latest/web-apis/web-workers/concurrent-workers-two/worker.js'
      );
      workers.push(worker);

      worker.onmessage = function (e) {
        completedCount++;
        results.push(e.data);
        checkAllComplete();
      };

      worker.onerror = function (err) {
        completedCount++;
        results.push({
          success: false,
          message: 'Worker ' + i + ' errored: ' + (err ? err.message : 'unknown error')
        });
        checkAllComplete();
      };

      worker.postMessage({ workerId: i, startTime: Date.now() });
    }
  } catch (e) {
    clearTimeout(testTimeout);
    workers.forEach((w) => w.terminate());
    act.error('Failed to construct workers: ' + (e ? e.message : 'unknown error'));
  }
}

loadSDK(runTest);
