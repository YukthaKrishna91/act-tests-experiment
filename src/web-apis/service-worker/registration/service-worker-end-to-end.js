/* eslint-env browser */

onmessage = function (e) {
  var message = e.data;
  if (typeof message === 'object' && 'port' in message) {
    var response = 'ACK: ' + message.from;
    message.port.postMessage(response);
  }
};

// eslint-disable-next-line no-unused-vars
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
