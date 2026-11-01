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

function renderNodeList() {
  var listHtml = '<div>A</div><div>B</div><div>C</div><div>D</div><div>E</div>';
  var divElement = document.createElement('div');
  divElement.innerHTML = listHtml;
  divElement.id = 'nodeListParent';
  act.render(divElement);
}

function testForOfStatements() {
  var output = {
    status: true,
    reason: []
  };

  var testCases = [
    {
      description: 'for-of statement with Array',
      expectedResult: 'abc',
      test: `
        function concatArray (x) {
          var result = "";
          for (var element of x) { result += element; }
          return result;
        }
        concatArray(["a","b","c"])
      `
    },
    {
      description: 'for-of statement with NodeList',
      expectedResult: 'ABCDE',
      test: `
        function concatNodeList (x) {
          var result = "";
          for (var element of x) { result += element.innerText; }
          return result;
        }
        concatNodeList(document.getElementById('nodeListParent').childNodes)
      `
    },
    {
      description: 'for-of statement with String',
      expectedResult: 'a-b-c-d-e-',
      test: `(function () {
        var string = 'abcde'
        var result = ''
        for (var letter of string) {
          result += letter + '-'
        }
        return result
      })()
      `
    },
    {
      description: 'for-of statement with generators',
      expectedResult: 'abc-def-ghi-',
      test: `(function () {
        function* generatorFn() {
          yield 'abc'
          yield 'def'
          yield 'ghi'
        }
        var result = ''
        for (var element of generatorFn()) {
          result += element + '-'
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
  renderNodeList();
  var testOutcome = testForOfStatements();
  if (testOutcome.status) {
    act.success();
  } else {
    act.fail('ECMAScript 6 for...of statements test failed - see log for details');
  }
}

loadSDK(runTest);
