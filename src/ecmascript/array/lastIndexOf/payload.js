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

function getTheLastIndex() {
  var testcase = ['Automated', 'Certification', 'Test', 'Test'];
  var output = testcase.lastIndexOf('Test');
  var expected = 3;

  return output === expected;
}

function runTest() {
  act.start();
  try {
    getTheLastIndex()
      ? act.success()
      : act.fail(`Array.prototype.lastIndexOf() failed to work as expected`);
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
