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
    description: 'Array.of() with one element',
    run: function () {
      var array = Array.of(5);
      return array[0] === 5 && Array.isArray(array) && array.length === 1;
    }
  },
  {
    description: 'Array.of() with multiple elements',
    run: function () {
      var array = Array.of(2, 4, 6);
      return array[0] === 2 && array[1] === 4 && array[2] === 6 && array.length === 3;
    }
  },
  {
    description: 'Array.of() with string elements',
    run: function () {
      var array = Array.of('x', 'y');
      return array[0] === 'x' && array[1] === 'y' && array.length === 2;
    }
  },
  {
    description: 'Array.of() with object elements',
    run: function () {
      var array = Array.of({ x: 'a' }, { y: 'b' });
      return array[0].x === 'a' && array[1].y === 'b' && array.length === 2;
    }
  }
];

function runTest() {
  act.start();
  if (typeof Array.of !== 'function') {
    act.fail('Array.of() is not implemented on this device');
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
      act.log([test.description + ' test failed with error', error.message]);
      anyFailures = true;
    }
  }

  if (!anyFailures) {
    act.success();
  } else {
    act.fail('ECMAScript 6 Array.of() test failed - see log for details');
  }
}

loadSDK(runTest);
