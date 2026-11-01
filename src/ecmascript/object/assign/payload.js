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
      'If you call object.assign, the object that is returned is the target object that is passed in.',
    run: function () {
      var target = { a: 1, b: 2 };
      var source = { b: 4, c: 5 };

      var returnedTarget = Object.assign(target, source);
      return returnedTarget === target;
    }
  },
  {
    description:
      'If you call object.assign with multiple sources all properties on all sources are copied onto the target object',
    run: function () {
      var target = { a: 1, b: 2 };
      var source1 = { c: 4, d: 5 };
      var source2 = { e: 5, f: 6 };
      var source3 = { g: 7, h: 8 };

      var returnedTarget = Object.assign(target, source1, source2, source3);
      return (
        returnedTarget.a === 1 &&
        returnedTarget.b === 2 &&
        returnedTarget.c === 4 &&
        returnedTarget.d === 5 &&
        returnedTarget.e === 5 &&
        returnedTarget.f === 6 &&
        returnedTarget.g === 7 &&
        returnedTarget.h === 8
      );
    }
  },
  {
    description:
      'If you call object.assign with multiple sources containing the same keys then the property value comes from the latest source ',
    run: function () {
      var target = { a: 1, b: 2 };
      var source1 = { b: 4, c: 7 };
      var source2 = { c: 5, d: 6 };

      var returnedTarget = Object.assign(target, source1, source2);
      return (
        returnedTarget.a === 1 &&
        returnedTarget.b === 4 &&
        returnedTarget.c === 5 &&
        returnedTarget.d === 6
      );
    }
  },

  {
    description: 'If you call object.assign, only own properties are copied from source object.',
    run: function () {
      var target = { a: 1, b: 2 };
      var sourceParent = { b: 9, l: 9 };
      var source = { b: 4, c: 5, __proto__: sourceParent };

      var returnedTarget = Object.assign(target, source);
      return (
        returnedTarget.a === 1 &&
        returnedTarget.b === 4 &&
        returnedTarget.c === 5 &&
        returnedTarget.l === undefined
      );
    }
  },

  {
    description:
      'If you call object.assign, only enumerable properies will be copied from source object',
    run: function () {
      var target = { a: 1, b: 2 };
      var source = { b: 4, c: 5 };
      Object.defineProperty(source, 'l', {
        value: 42,
        enumerable: false
      });

      var returnedTarget = Object.assign(target, source);
      return (
        returnedTarget.a === 1 &&
        returnedTarget.b === 4 &&
        returnedTarget.c === 5 &&
        returnedTarget.l === undefined
      );
    }
  }
];

function runTest() {
  act.start();
  if (typeof Object.assign !== 'function') {
    act.fail('Object.assign() is not implemented on this device');
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
    act.fail('ECMAScript 6 Object.assign() test failed - see log for details');
  }
}

loadSDK(runTest);
