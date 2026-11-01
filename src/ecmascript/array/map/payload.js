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

function arrayMaptest() {
  var mapping1 = [45, 4, 9, 16, 25];
  var output = [];
  var expected = [90, 8, 18, 32, 50];

  try {
    output = mapping1.map(testTheMap);
  } catch (e) {
    output = [];
    act.error('Unexpected error: ' + (e && e.message) || 'unknown');
  }

  var result = true;

  for (var i = 0; i < expected.length; i++) {
    if (expected[i] !== output[i]) {
      result = false;
    }
  }

  return result;
}

function testTheMap(value) {
  return value * 2;
}

function runTest() {
  act.start();
  try {
    arrayMaptest() ? act.success() : act.fail(`Array.prototype failed to work as expected`);
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
