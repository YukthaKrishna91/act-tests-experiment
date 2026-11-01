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

function testSort() {
  var testcase = ['Car', 'Aeroplane', 'Train', 'Boat'];
  var output = testcase.sort();
  var expected = 'Aeroplane,Boat,Car,Train,';
  var testString = '';

  for (var i = 0; i < output.length; i++) {
    testString += output[i] + ',';
  }

  return testString === expected;
}

function runTest() {
  act.start();
  try {
    testSort() ? act.success() : act.fail(`Array.prototype.sort() failed to work as expected`);
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
