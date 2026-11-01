'use strict';

const result = {
  success: false,
  message: 'requestAnimationFrame did not run'
};

try {
  if (typeof self.requestAnimationFrame !== 'function') {
    result.message = 'requestAnimationFrame is not available in the worker';
    self.postMessage(result);
  } else {
    const requestId = self.requestAnimationFrame((timestamp) => {
      if (typeof timestamp === 'number') {
        result.success = true;
        result.message =
          'requestAnimationFrame is available and executed correctly with timestamp: ' + timestamp;
      } else {
        result.message =
          'requestAnimationFrame callback executed but timestamp is invalid: ' + typeof timestamp;
      }
      self.postMessage(result);
    });

    if (typeof requestId !== 'number') {
      result.message = 'requestAnimationFrame did not return a number: ' + typeof requestId;
      self.postMessage(result);
    }
  }
} catch (e) {
  result.message = 'Error testing requestAnimationFrame: ' + (e ? e.message : 'unknown error');
  self.postMessage(result);
}
