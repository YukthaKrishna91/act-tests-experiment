'use strict';

self.onmessage = function (e) {
  if (e.data === 'ping') {
    self.postMessage('pong');
  }
};
