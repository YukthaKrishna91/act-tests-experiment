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

function arrayEveryTest() {
  var testNumbers = [1, 22, 25, 60, 67];
  var output = '';
  var expected = false;

  output = testNumbers.every(checkTheEvery);

  return output === expected;
}

function runTest() {
  act.start();
  try {
    arrayEveryTest()
      ? act.success()
      : act.fail(`Array.prototype.every() failed to work as expected`);
  } catch (e) {
    act.fail(e.message);
  }
}

function checkTheEvery(value) {
  return value > 18;
}

loadSDK(runTest);
