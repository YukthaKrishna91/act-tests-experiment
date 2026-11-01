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
    description: 'Object.is returns true for arguments undefined and undefined',
    run: function () {
      return Object.is(undefined, undefined);
    }
  },

  {
    description: 'Object.is returns false for arguments undefined and not undefined ',
    run: function () {
      return !Object.is(undefined, 'Testing');
    }
  },

  {
    description: 'Object.is returns true for arguments which are both null ',
    run: function () {
      return Object.is(null, null);
    }
  },

  {
    description: 'Object.is returns false for arguments which are null and not null ',
    run: function () {
      return !Object.is(null, true);
    }
  },

  {
    description: 'Object.is returns true for arguments which are both true ',
    run: function () {
      return Object.is(true, true);
    }
  },

  {
    description: 'Object.is returns false for arguments which are true and false ',
    run: function () {
      return !Object.is(true, false);
    }
  },

  {
    description: 'Object.is returns true for arguments which are both false ',
    run: function () {
      return Object.is(false, false);
    }
  },

  {
    description: 'Object.is returns false for arguments which are true and false ',
    run: function () {
      return !Object.is(false, true);
    }
  },

  {
    description:
      'Object.is returns true for strings of the same length with the same characters in the same order  ',
    run: function () {
      return Object.is('Same string', 'Same string');
    }
  },

  {
    description:
      'Object.is returns false for strings of different lengths with the same characters in the same order  ',
    run: function () {
      return !Object.is('Same strings', 'Same string');
    }
  },

  {
    description: 'Object.is returns true for both the same object',
    run: function () {
      var a = { foo: 'bar' };
      return Object.is(a, a);
    }
  },

  {
    description: 'Object.is returns false for two different objects even if identical',
    run: function () {
      var a = { foo: 'bar' };
      var b = { foo: 'bar' };
      return !Object.is(a, b);
    }
  },

  {
    description: 'Object.is returns true for two positive zeros',
    run: function () {
      return Object.is(+0, +0);
    }
  },

  {
    description: 'Object.is returns true for two negative zeros',
    run: function () {
      return Object.is(-0, -0);
    }
  },

  {
    description: 'Object.is returns false for one positive zero and one negative zero',
    run: function () {
      return !Object.is(-0, +0);
    }
  },

  {
    description: 'Object.is returns true for two NaN values',
    run: function () {
      return Object.is(NaN, NaN);
    }
  },

  {
    description: 'Object.is returns false for Nan versus another number',
    run: function () {
      return !Object.is(NaN, 4);
    }
  },

  {
    description:
      'Object.is returns true two numbers both non-zero and both not NaN and both have the same value ',
    run: function () {
      return Object.is(2.5, 2.5);
    }
  },

  {
    description:
      'Object.is returns false two numbers both non-zero and both not NaN and both have different values',
    run: function () {
      return !Object.is(2.5, 4);
    }
  },
  {
    description: 'Object.is returns false for a number and its string equivalent. ',
    run: function () {
      return !Object.is(0, '0');
    }
  }
];

function runTest() {
  act.start();
  if (typeof Object.is !== 'function') {
    act.fail('Object.is() is not implemented on this device');
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
    act.fail('ECMAScript 6 Object.is() test failed - see log for details');
  }
}

loadSDK(runTest);
