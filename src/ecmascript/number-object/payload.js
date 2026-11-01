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
    description: 'constants',
    run: function () {
      return (
        typeof Number.EPSILON === 'number' &&
        typeof Number.MAX_SAFE_INTEGER === 'number' &&
        typeof Number.MIN_SAFE_INTEGER === 'number' &&
        typeof Number.MAX_VALUE === 'number' &&
        typeof Number.MIN_VALUE === 'number' &&
        typeof Number.POSITIVE_INFINITY === 'number' &&
        typeof Number.NEGATIVE_INFINITY === 'number' &&
        typeof Number.NaN === 'number'
      );
    }
  },
  {
    description: 'Number.isFinite()',
    run: function () {
      return (
        Number.isFinite(123456) &&
        Number.isFinite(-654321) &&
        !Number.isFinite(Number.POSITIVE_INFINITY) &&
        !Number.isFinite(Number.NEGATIVE_INFINITY)
      );
    }
  },
  {
    description: 'Number.isInteger()',
    run: function () {
      return (
        Number.isInteger(12345678) &&
        Number.isInteger(-87654321) &&
        !Number.isInteger(12345.67) &&
        !Number.isInteger(-12345.12)
      );
    }
  },
  {
    description: 'Number.isSafeInteger()',
    run: function () {
      return (
        Number.isSafeInteger(1234) &&
        Number.isSafeInteger(Number.MAX_SAFE_INTEGER) &&
        Number.isSafeInteger(Number.MIN_SAFE_INTEGER) &&
        !Number.isSafeInteger(Number.MAX_SAFE_INTEGER + 1) &&
        !Number.isSafeInteger(Number.MIN_SAFE_INTEGER - 1)
      );
    }
  },
  {
    description: 'Number.isNan()',
    run: function () {
      return (
        Number.isNaN(0 / 0) &&
        Number.isNaN(Number.NaN) &&
        !Number.isNaN(-1010101) &&
        !Number.isNaN(8989898)
      );
    }
  },
  {
    description: 'Number.parseInt()',
    run: function () {
      return (
        Number.parseInt('1999') === 1999 &&
        Number.parseInt('1011', 2) === 11 &&
        Number.parseInt(' 0xF', 16) === 15
      );
    }
  },
  {
    description: 'Number.parseFloat()',
    run: function () {
      return (
        Number.parseFloat('1.999') === 1.999 &&
        Number.parseFloat('-0.1298') === -0.1298 &&
        Number.parseFloat('3E3') === 3000 &&
        Number.parseFloat('4e5') === 400000
      );
    }
  }
];

function runTest() {
  act.start();
  if (typeof Number === 'undefined') {
    act.fail('The Number object is not implemented on this device');
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
    act.fail('ECMAScript 6 Number object test failed - see log for details');
  }
}

loadSDK(runTest);
