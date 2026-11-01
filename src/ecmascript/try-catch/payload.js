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

function testTryCatch() {
  var result = false;
  try {
    throw new Error();
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    result = true;
  }
  return result;
}

function runTest() {
  act.start();
  try {
    testTryCatch()
      ? act.success()
      : act.fail(`Failed to catch the thrown Error() in try-catch expression`);
  } catch (e) {
    act.error(e.message);
  }
}

loadSDK(runTest);
