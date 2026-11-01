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

function formatErrorMessage(testName, expected, error) {
  return testName + ' did not return expected value (' + expected + ') instead got (' + error + ')';
}

function testSpreadSyntax() {
  var output = {
    status: true,
    reason: []
  };

  var tests = [
    {
      expected: 5,
      assertation:
        'function sum (w, x, y, z) { return w + x + y + z } sum(-1, ...[1, 2, 3], -1, ...[1, 2])'
    },
    {
      expected: true,
      assertation: '(function () { return Math.max(...[1, 2, 3]) === 3 })()'
    },
    {
      expected: 'abc',
      assertation: '(function () { var a = ["a", "b"]; return [...a, "c"].join("") })()'
    }
  ];

  do {
    var test = tests.pop();
    var actual, outcome;
    var error = '';
    try {
      actual = eval(test.assertation);
      outcome = test.expected === actual;
    } catch (e) {
      error = e.message;
      outcome = false;
    } finally {
      if (outcome !== true) {
        output.status = false;
        act.log(formatErrorMessage(test.assertation, test.expected, error || actual));
      }
    }
  } while (tests.length);

  return output;
}

function runTest() {
  act.start();
  try {
    var testOutcome = testSpreadSyntax();
    testOutcome.status
      ? act.success()
      : act.fail('Device does not support ES6 spread syntax (...) - see log for details');
  } catch (e) {
    act.log(e.message);
    act.fail('Device does not support ES6 spread syntax (...) - see log for details');
  }
}

loadSDK(runTest);
