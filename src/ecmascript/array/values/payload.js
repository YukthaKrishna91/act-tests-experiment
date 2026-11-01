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

function formatErrorMessage(description, expected, error) {
  return (
    description +
    ' test did not return expected value (' +
    expected +
    ') instead got (' +
    error +
    ')'
  );
}

function testArrayValues() {
  if (typeof Array.prototype.values !== 'function') {
    act.fail('Array.prototype.values() is not implemented on this device');
    return;
  }

  var output = {
    status: true,
    reason: []
  };

  var testCases = [
    {
      description: 'Array.prototype.values() returns an iterator containing the array values',
      expectedResult: 'abc',
      test: `(function () {
          var array = ['a', 'b', 'c']
          var result = ''
          for (var value of array.values()) {
            result += value
          }
          return result
        })()
      `
    }
  ];

  do {
    var test = testCases.pop();
    var actual, outcome;
    var error = '';
    try {
      actual = eval(test.test);
      outcome = test.expectedResult === actual;
    } catch (e) {
      error = 'Device does not support ' + test.description;
      act.log([error, e.message]);
      outcome = false;
    } finally {
      if (outcome !== true) {
        output.status = false;
        act.log(formatErrorMessage(test.description, test.expectedResult, error || actual));
      }
    }
  } while (testCases.length);

  return output;
}

function runTest() {
  act.start();

  var testOutcome = testArrayValues();
  if (testOutcome.status) {
    act.success();
  } else {
    act.fail('ECMAScript 6 Array.prototype.values() test failed - see log for details');
  }
}

loadSDK(runTest);
