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

function testSomeArray(value) {
  return value > 18;
}

function arraySomeTestPositive() {
  var testNumbers = [1, 3, 19, 22, 101];
  try {
    return testNumbers.some(testSomeArray);
  } catch (e) {
    act.error('Unexpected error: ' + (e && e.message) || 'unknown');
    return false;
  }
}

function runTest() {
  act.start();
  try {
    arraySomeTestPositive()
      ? act.success()
      : act.fail(`Array.prototype.some() failed to work as expected`);
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
