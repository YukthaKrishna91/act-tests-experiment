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

var tests = [
  {
    description:
      'Returns an amended array using array.copyWithin and copies to index 0 the element at index 3',
    run: function () {
      var inputArray = ['a', 'b', 'c', 'd', 'e'];
      var returnedArray = inputArray.copyWithin(0, 3, 4);
      return (
        returnedArray[0] === 'd' &&
        returnedArray[1] === 'b' &&
        returnedArray[2] === 'c' &&
        returnedArray[3] === 'd' &&
        returnedArray[4] === 'e' &&
        returnedArray === inputArray &&
        returnedArray.length === 5
      );
    }
  },

  {
    description:
      'Returns an amended array using array.copyWithin and copies to index 1 all elements from index 3 to the end',
    run: function () {
      var inputArray = ['a', 'b', 'c', 'd', 'e'];
      var returnedArray = inputArray.copyWithin(1, 3);
      return (
        returnedArray[0] === 'a' &&
        returnedArray[1] === 'd' &&
        returnedArray[2] === 'e' &&
        returnedArray[3] === 'd' &&
        returnedArray[4] === 'e' &&
        returnedArray.length === 5
      );
    }
  },

  {
    description: 'array.copyWithin Returns an amended array using a single argument',
    run: function () {
      var inputArray = ['a', 'b', 'c', 'd', 'e'];
      var returnedArray = inputArray.copyWithin(1);
      return (
        returnedArray[0] === 'a' &&
        returnedArray[1] === 'a' &&
        returnedArray[2] === 'b' &&
        returnedArray[3] === 'c' &&
        returnedArray[4] === 'd' &&
        returnedArray.length === 5
      );
    }
  }
];

function runTest() {
  act.start();
  if (typeof Array.prototype.copyWithin !== 'function') {
    act.fail('Array.prototype.copyWithin() is not implemented on this device');
    return;
  }

  var anyFailures = false;

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    try {
      var success = test.run();
      if (!success) {
        act.log(test.description + ' test failed');
        anyFailures = true;
      }
    } catch (error) {
      act.log([test.description + ' test error', error.message]);
      anyFailures = true;
    }
  }

  if (!anyFailures) {
    act.success();
  } else {
    act.fail('ECMAScript 6 array.prototype.copyWithin test failed - see log for details');
  }
}

loadSDK(runTest);
