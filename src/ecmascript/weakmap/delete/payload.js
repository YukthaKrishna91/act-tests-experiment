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

var strongReffedKey = {};
var anotherStrongReffedKey = {};

var tests = [
  {
    description: 'Can not delete unknown key in empty WeakMap',
    run: function () {
      var weakMap = new WeakMap();
      return weakMap.delete({ notThere: 'not-there' }) === false;
    }
  },
  {
    description: 'Can not delete unknown key in non-empty WeakMap',
    run: function () {
      var weakMap = new WeakMap();
      weakMap.set(strongReffedKey, 1);
      return (
        weakMap.delete({ notThere: 'not-there' }) === false && weakMap.get(strongReffedKey) === 1
      );
    }
  },
  {
    description: 'Can delete known key in non-empty WeakMap',
    run: function () {
      var weakMap = new WeakMap();
      weakMap.set(strongReffedKey, 1);
      weakMap.set(anotherStrongReffedKey, 2);
      return weakMap.delete(strongReffedKey) === true && weakMap.get(strongReffedKey) === undefined;
    }
  },
  {
    description: 'Can not delete previously deleted key in non-empty WeakMap',
    run: function () {
      var weakMap = new WeakMap();
      weakMap.set(strongReffedKey, 1);
      weakMap.set(anotherStrongReffedKey, 2);
      weakMap.delete(strongReffedKey);
      return weakMap.delete(strongReffedKey) === false;
    }
  }
];

function runTest() {
  act.start();
  if (typeof WeakMap !== 'function') {
    act.fail('The WeakMap built-in object is not implemented on this device');
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
    act.fail('ECMAScript 6 WeakMap.prototype.delete() test failed - see log for details');
  }
}

loadSDK(runTest);
