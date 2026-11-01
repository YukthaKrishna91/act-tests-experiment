'use strict';

self.onmessage = function (e) {
  if (e.data === 'start-heavy-task') {
    // Perform a CPU-intensive task
    let result = 0;
    for (let i = 0; i <= 1000000000; i++) {
      result += Math.sqrt(i);
    }
    self.postMessage('heavy-task-completed: ' + result);
  }
};
