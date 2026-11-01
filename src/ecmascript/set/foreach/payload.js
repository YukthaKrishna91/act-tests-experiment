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

var combinedSetElements = '';

function combineSetElements(item, itemAgain) {
  if (item !== itemAgain) {
    throw new Error(
      'Set iteration with forEach expects each value passed twice to function, but got ' +
        item +
        ' ' +
        itemAgain
    );
  }
  combinedSetElements += item;
}

var tests = [
  {
    description: 'forEach on constructed empty Set',
    expectedResult: '',
    run: function () {
      new Set().forEach(combineSetElements);
    }
  },
  {
    description: 'forEach on constructed non-empty Set',
    expectedResult: 'bca',
    run: function () {
      new Set(['b', 'c', 'a']).forEach(combineSetElements);
    }
  },
  {
    description: 'forEach on constructed non-empty Set does not contain deleted keys',
    expectedResult: 'ba',
    run: function () {
      var set = new Set(['b', 'c', 'a']);
      set.delete('c');
      set.forEach(combineSetElements);
    }
  }
];

function runTest() {
  act.start();
  if (typeof Set !== 'function') {
    act.fail('The Set built-in object is not implemented on this device');
    return;
  }

  var anyFailures = false;

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];

    try {
      combinedSetElements = '';
      test.run();
      var success = combinedSetElements === test.expectedResult;
      if (!success) {
        act.log(formatErrorMessage(test.description, test.expectedResult, combinedSetElements));
        anyFailures = true;
      }
    } catch (error) {
      act.log([test.description + ' test failed with error', error.message]);
      anyFailures = true;
    }
  }

  if (!anyFailures) {
    act.success();
  } else {
    act.fail('ECMAScript 6 Set.prototype.forEach() test failed - see log for details');
  }
}

loadSDK(runTest);
