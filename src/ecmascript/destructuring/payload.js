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

function testDestructuring() {
  var output = {
    status: true,
    reason: []
  };

  var testCases = [
    {
      description: 'array destructuring',
      expectedResult: '1_2_4_',
      test: `
        function testArrayDestructuring (x) {
          var list = ["1_","2_","3_","4_"];
          var [a,b,,c] = list;
          return a + b + c;
        }
        testArrayDestructuring()
      `
    },
    {
      description: 'object destructuring',
      expectedResult: '5_6_7_',
      test: `
        function testObjectDestructuring (x) {
          var obj = {a: "5_", deep: {b: "6_"}, c: "7_"};
          var {a, deep: {b}, c} = obj;
          return a + b + c;
        }
        testObjectDestructuring()
      `
    },
    {
      description: 'parameter context matching with destructuring',
      expectedResult: 'A_B_A_B_A_B_',
      test: `
        function testParameterContextMatching () {
          function testA ([a, b]) {return a + b;}
          function testB ({a, b}) {return a + b;}
          function testC ({a: c, b: d}) {return c + d;}
          var a = "A_"; var b = "B_";
          return testA([a, b]) + testB({"a": a, "b": b}) + testC({"a": a, "b": b});
        }
        testParameterContextMatching()
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
  var testOutcome = testDestructuring();
  if (testOutcome.status) {
    act.success();
  } else {
    act.fail('ECMAScript 6 destructuring test failed - see log for details');
  }
}

loadSDK(runTest);
