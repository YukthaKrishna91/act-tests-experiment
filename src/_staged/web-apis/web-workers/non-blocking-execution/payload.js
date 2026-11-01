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
    clearInterval(mainThreadInterval);
    act.fail('Test timed out after 10 seconds');
  }, 10000); // Increased timeout for heavy task

  let mainThreadTickCount = 0;
  const mainThreadInterval = setInterval(() => {
    mainThreadTickCount++;
  }, 50);

  try {
    const worker = new Worker(
      '/act/test/monorepo/latest/web-apis/web-workers/non-blocking-execution/worker.js'
    );

    worker.onmessage = function (e) {
      console.log(e.data);
      if (e.data.includes('heavy-task-completed')) {
        clearInterval(mainThreadInterval);
        if (mainThreadTickCount >= 5) {
          act.success();
        } else {
          act.fail('Main thread was blocked. Only ' + mainThreadTickCount + ' ticks occurred.');
        }
      } else {
        act.fail('Received unexpected message from worker: ' + e.data);
      }
      clearTimeout(testTimeout);
      worker.terminate();
    };

    worker.onerror = function (err) {
      clearInterval(mainThreadInterval);
      act.fail('Worker errored: ' + (err ? err.message : 'unknown error'));
      clearTimeout(testTimeout);
    };

    worker.postMessage('start-heavy-task');
  } catch (e) {
    clearInterval(mainThreadInterval);
    act.error('Failed to construct worker: ' + (e ? e.message : 'unknown error'));
    clearTimeout(testTimeout);
  }
}

loadSDK(runTest);
