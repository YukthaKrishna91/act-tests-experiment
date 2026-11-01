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

function testStringTrimFunction() {
  var strWithSpaces = '  TV Partner Engineering  ';
  var output = strWithSpaces.trim();
  var expected = 'TV Partner Engineering';

  return output === expected;
}

function runTest() {
  act.start();
  try {
    testStringTrimFunction()
      ? act.success()
      : act.fail(`String.prototype.trim() didn't trim whitespaces correctly`);
  } catch (e) {
    act.error(e.message);
  }
}

loadSDK(runTest);
