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

function testConstAndLet() {
  var output = {
    status: true,
    reason: []
  };

  var testCases = [
    {
      description: 'const',
      expectedResult: 3.14159,
      test: `
        function testConst() {
          const PI = 3.14159;
          return PI;
        }
        testConst()
      `
    },
    {
      description: 'let',
      expectedResult: 5,
      test: `
        function testLet() {
          let a;
          a = 5;
          return a;
        }
        testLet()
      `
    },
    {
      description: 'block-scoped variables using let',
      expectedResult: 'abcde',
      test: `
        function testBlockScopedVariables() {
          let a = ["a", "b", "c", "d", "e"];
          let b = [];
          for (let i = 0; i < a.length; i++) {
            let x = a[i];
            b.push(x);
          }
          return b.join("");
        }
        testBlockScopedVariables()
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
  var testOutcome = testConstAndLet();
  if (testOutcome.status) {
    act.success();
  } else {
    act.fail('ECMAScript 6 const and let test failed - see log for details');
  }
}

loadSDK(runTest);
