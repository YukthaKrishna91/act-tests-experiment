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
    description: 'Returns an amended array using array.fill ',
    run: function () {
      var inputArray = [1, 2, 3, 4];
      var returnedArray = inputArray.fill(0, 2, 4);
      return (
        returnedArray[0] === 1 &&
        returnedArray[1] === 2 &&
        returnedArray[2] === 0 &&
        returnedArray[3] === 0 &&
        returnedArray === inputArray &&
        returnedArray.length === 4
      );
    }
  },

  {
    description: 'array.fill ,returns an amended array without the index and just the value ',
    run: function () {
      var inputArray = [1, 2, 3, 4];
      var returnedArray = inputArray.fill(6);
      return (
        returnedArray[0] === 6 &&
        returnedArray[1] === 6 &&
        returnedArray[2] === 6 &&
        returnedArray[3] === 6 &&
        returnedArray.length === 4
      );
    }
  },

  {
    description: 'array.fill, returns an amended array with start index and no end index ',
    run: function () {
      var inputArray = [1, 2, 3, 4];
      var returnedArray = inputArray.fill(5, 1);
      return (
        returnedArray[0] === 1 &&
        returnedArray[1] === 5 &&
        returnedArray[2] === 5 &&
        returnedArray[3] === 5 &&
        returnedArray.length === 4
      );
    }
  },

  {
    description:
      ' array.fill has a start and end index, where end index occurs before end of array',
    run: function () {
      var inputArray = [1, 2, 3, 4, 5, 6, 7, 8];
      var returnedArray = inputArray.fill(99, 2, 4);
      return (
        returnedArray[0] === 1 &&
        returnedArray[1] === 2 &&
        returnedArray[2] === 99 &&
        returnedArray[3] === 99 &&
        returnedArray[4] === 5 &&
        returnedArray.length === 8
      );
    }
  }
];

function runTest() {
  act.start();
  if (typeof Array.prototype.fill !== 'function') {
    act.fail('Array.prototype.fill() is not implemented on this device');
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
    act.fail('ECMAScript 6 array.prototype.fill test failed - see log for details');
  }
}

loadSDK(runTest);
