'use strict';

self.onmessage = function (e) {
  const workerId = e.data.workerId;
  const startTime = e.data.startTime;

  const result = {
    success: false,
    workerId: workerId,
    message: 'Worker did not complete'
  };

  try {
    let sum = 0;
    for (let i = 0; i < 10000000; i++) {
      sum += Math.sqrt(i);
    }
    // Avoid lint error
    sum;

    const endTime = Date.now();
    result.success = true;
    result.duration = endTime - startTime;
    result.message = 'Worker ' + workerId + ' completed in ' + result.duration + 'ms';
  } catch (err) {
    result.message = 'Worker ' + workerId + ' error: ' + (err ? err.message : 'unknown error');
  }

  self.postMessage(result);
};
