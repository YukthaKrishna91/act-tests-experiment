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

function assertEquals(expected, actual) {
  return expected === actual;
}

function formatErrorMessage(testName, expected, error) {
  return testName + ' did not return ' + expected + ' got (' + error + ')';
}

function testArrowFunctions() {
  var tests = [];
  var output = {
    status: false,
    reason: []
  };

  var empty = function () {
    return undefined;
  };

  // Check return types and prototype
  tests[1] = { expected: 'function', actual: 'typeof (() => { })' };
  tests[2] = { expected: undefined, actual: '(() => { })()' };
  tests[3] = { expected: empty, actual: '(x => x)(empty)' };

  // Check the different syntax variations
  tests[4] = { expected: 1, actual: '(() => 1)()' };
  tests[5] = { expected: 2, actual: '(a => a + 1)(1)' };
  tests[6] = { expected: 3, actual: '(() => { return 3 })()' };
  tests[7] = { expected: 4, actual: '(a => { return a + 3 })(1)' };
  tests[8] = { expected: 5, actual: '((a, b) => a + b)(1, 4)' };
  tests[9] = { expected: 6, actual: '((a, b) => { return a + b })(1, 5)' };
  tests[10] = { expected: 9, actual: '(x => x * x)(3)' };

  for (var i = 1; i < tests.length; i++) {
    try {
      var result = assertEquals(tests[i].expected, eval(tests[i].actual));
      if (result === true) {
        output.status = true;
        continue;
      }
    } catch (e) {
      output.status = false;
      output.reason.push(formatErrorMessage(tests[i].actual, tests[i].expected, e.message));
    }
  }

  return output;
}

function runTest() {
  act.start();
  try {
    var testOutcome = testArrowFunctions();
    testOutcome.status ? act.success() : act.fail(testOutcome.reason);
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
