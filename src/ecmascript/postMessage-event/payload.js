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

window.addEventListener(
  'message',
  function (event) {
    if (event.data === 'message') {
      act.success();
    } else {
      act.fail(`Failed to read posted message from window.postMessage()`);
    }
  },
  null
);

function runTest() {
  act.start();
  try {
    window.postMessage('message', '*');
  } catch (e) {
    act.error(e.message);
  }
}

loadSDK(runTest);
