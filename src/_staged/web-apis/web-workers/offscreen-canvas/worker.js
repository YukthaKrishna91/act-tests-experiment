'use strict';

const result = {
  success: false,
  message: 'OffscreenCanvas test did not complete'
};

try {
  if (typeof self.OffscreenCanvas !== 'function') {
    result.message = 'OffscreenCanvas is not available in the worker';
    self.postMessage(result);
  } else {
    const canvas = new self.OffscreenCanvas(100, 100);
    if (canvas && canvas.width === 100 && canvas.height === 100) {
      result.success = true;
      result.message = 'OffscreenCanvas is supported and can be instantiated';
    } else {
      result.message = 'OffscreenCanvas was created but properties are invalid';
    }
    self.postMessage(result);
  }
} catch (e) {
  result.message = 'Error testing OffscreenCanvas: ' + (e ? e.message : 'unknown error');
  self.postMessage(result);
}
