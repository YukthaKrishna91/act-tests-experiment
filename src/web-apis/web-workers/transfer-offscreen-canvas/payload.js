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

  const $container = document.createElement('div');
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  $container.appendChild(canvas);

  act.render($container, function () {
    try {
      if (typeof canvas.transferControlToOffscreen !== 'function') {
        clearTimeout(testTimeout);
        act.fail('transferControlToOffscreen method is not available on canvas element');
        return;
      }

      const offscreen = canvas.transferControlToOffscreen();

      if (!(offscreen instanceof OffscreenCanvas)) {
        clearTimeout(testTimeout);
        act.fail('transferControlToOffscreen did not return an OffscreenCanvas');
        return;
      }

      const worker = new Worker(
        '/act/test/monorepo/latest/web-apis/web-workers/transfer-offscreen-canvas/worker.js'
      );

      worker.onmessage = function (e) {
        const result = e.data;
        if (result.success) {
          act.success();
        } else {
          act.fail(result.message || 'Worker reported failure');
        }
        clearTimeout(testTimeout);
        worker.terminate();
      };

      worker.onerror = function (err) {
        act.fail('Worker errored: ' + (err ? err.message : 'unknown error'));
        clearTimeout(testTimeout);
      };

      worker.postMessage({ canvas: offscreen }, [offscreen]);
    } catch (e) {
      clearTimeout(testTimeout);
      act.error('Failed to transfer OffscreenCanvas: ' + (e ? e.message : 'unknown error'));
    }
  });
}

loadSDK(runTest);
