'use strict';

self.onmessage = function (e) {
  const result = {
    success: false,
    message: 'OffscreenCanvas transfer test did not complete'
  };

  try {
    const offscreen = e.data.canvas;

    if (!offscreen) {
      result.message = 'No canvas received in worker';
      self.postMessage(result);
      return;
    }

    if (!(offscreen instanceof OffscreenCanvas)) {
      result.message = 'Received object is not an OffscreenCanvas';
      self.postMessage(result);
      return;
    }

    if (offscreen.width !== 100 || offscreen.height !== 100) {
      result.message =
        'OffscreenCanvas dimensions are incorrect: ' + offscreen.width + 'x' + offscreen.height;
      self.postMessage(result);
      return;
    }

    const ctx = offscreen.getContext('2d');

    if (!ctx) {
      result.message = 'Could not get 2d context from transferred OffscreenCanvas';
      self.postMessage(result);
      return;
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 50, 50);

    result.success = true;
    result.message = 'OffscreenCanvas was successfully transferred and rendered to';
    self.postMessage(result);
  } catch (err) {
    result.message = 'Error in worker: ' + (err ? err.message : 'unknown error');
    self.postMessage(result);
  }
};
