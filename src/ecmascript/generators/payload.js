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

function testGenerators() {
  var output = {
    status: true,
    reason: []
  };

  var testCases = [
    {
      description: 'generator functions',
      expectedResult: 'aBcD',
      test: `
        function testGenerators () {
          var generateLetters = function* () {
            var letters = ["a","B","c","D"];
            for (var i = 0; i < letters.length; i++) { yield letters[i] }
          };
          var concatenatedLetters = "";
          var letterGenerator = generateLetters();
          var next;
          while (!(next = letterGenerator.next()).done) {
            concatenatedLetters += next.value
          }
          return concatenatedLetters;
        }
        testGenerators()
      `
    },
    {
      description: 'generator methods',
      expectedResult: 'eFgH',
      test: `
        function testGenerators () {
          var Obj = { * generatorMethod() {
            var letters = ["e","F","g","H"];
            for (var i = 0; i < letters.length; i++) { yield letters[i] }
          }};
          var concatenatedLetters = "";
          var letterGenerator = Obj.generatorMethod();
          var next;
          while (!(next = letterGenerator.next()).done) {
            concatenatedLetters += next.value
          }
          return concatenatedLetters;
        }
        testGenerators()
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
  var testOutcome = testGenerators();
  if (testOutcome.status) {
    act.success();
  } else {
    act.fail('ECMAScript 6 generators test failed - see log for details');
  }
}

loadSDK(runTest);
