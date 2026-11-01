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

function ArrayIsArrayTest() {
  var words = ['Done', 'Progress', 'Ready', 'Testing', 'Hold', 'Blocked'];
  var output = false;
  var expected = true;

  try {
    output = Array.isArray(words);
  } catch (e) {
    output = false;
    act.error('Unexpected error: ' + (e && e.message) || 'unknown');
  }

  return expected === output;
}

function runTest() {
  act.start();
  try {
    ArrayIsArrayTest() ? act.success() : act.fail(`Array.prototype.isArray() failed`);
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
