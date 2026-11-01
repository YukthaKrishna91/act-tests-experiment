'use strict';

const result = {
  success: false,
  message: 'setTimeout did not run'
};

const failTimeout = setTimeout(() => {
  result.message = 'clearTimeout failed to stop the timeout from firing.';
  self.postMessage(result);
}, 500);

setTimeout(() => {
  clearTimeout(failTimeout);
  result.success = true;
  result.message = 'setTimeout and clearTimeout functioned correctly.';
  self.postMessage(result);
}, 100);
