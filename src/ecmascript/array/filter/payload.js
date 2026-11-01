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

function ArrayFilterTest() {
  var words = ['Done', 'Progress', 'Ready', 'Testing', 'Hold', 'Blocked'];
  var output = [];
  var expected = 'Progress,Testing,Blocked,';
  var strOutput = '';

  try {
    output = words.filter(filtering);
  } catch (e) {
    output = [];
    act.error('Unexpected error: ' + (e && e.message) || 'unknown');
  }

  for (var i = 0; i < output.length; i++) {
    strOutput += output[i] + ',';
  }

  return expected === strOutput;
}

function filtering(value) {
  return value.length > 6;
}

function runTest() {
  act.start();
  try {
    ArrayFilterTest()
      ? act.success()
      : act.fail(`Array.prototype.filter() failed to work as expected`);
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
