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

var combinedMapElements = '';

function combineMapElements(value, key) {
  combinedMapElements += key + value;
}

var tests = [
  {
    description: 'forEach on constructed empty Map',
    expectedResult: '',
    run: function () {
      new Map().forEach(combineMapElements);
    }
  },
  {
    description: 'forEach on constructed non-empty Map',
    expectedResult: 'b456c789a123',
    run: function () {
      new Map([
        ['b', 456],
        ['c', 789],
        ['a', 123]
      ]).forEach(combineMapElements);
    }
  },
  {
    description: 'forEach on constructed non-empty Map does not contain deleted keys',
    expectedResult: 'b456a123',
    run: function () {
      var map = new Map([
        ['b', 456],
        ['c', 789],
        ['a', 123]
      ]);
      map.delete('c');
      map.forEach(combineMapElements);
    }
  }
];

function runTest() {
  act.start();
  if (typeof Map !== 'function') {
    act.fail('The Map built-in object is not implemented on this device');
    return;
  }

  var anyFailures = false;

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];

    try {
      combinedMapElements = '';
      test.run();
      var success = combinedMapElements === test.expectedResult;
      if (!success) {
        act.log(formatErrorMessage(test.description, test.expectedResult, combinedMapElements));
        anyFailures = true;
      }
    } catch (error) {
      act.log(
        formatErrorMessage(test.description, test.expectedResult, error || combinedMapElements)
      );
      anyFailures = true;
    }
  }

  if (!anyFailures) {
    act.success();
  } else {
    act.fail('ECMAScript 6 Map forEach() test failed - see log for details');
  }
}

loadSDK(runTest);
