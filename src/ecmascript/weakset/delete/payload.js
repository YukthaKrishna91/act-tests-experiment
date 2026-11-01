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

var strongReffedItem = {};
var anotherStrongReffedItem = {};

var tests = [
  {
    description: 'Can not delete unknown item in empty WeakSet',
    run: function () {
      var weakSet = new WeakSet();
      return weakSet.delete({ notThere: 'not-there' }) === false;
    }
  },
  {
    description: 'Can not delete unknown item in non-empty WeakSet',
    run: function () {
      var weakSet = new WeakSet();
      weakSet.add(strongReffedItem);
      return weakSet.delete({ notThere: 'not-there' }) === false && weakSet.has(strongReffedItem);
    }
  },
  {
    description: 'Can delete known item in non-empty WeakSet',
    run: function () {
      var weakSet = new WeakSet();
      weakSet.add(strongReffedItem);
      weakSet.add(anotherStrongReffedItem);
      return weakSet.delete(strongReffedItem) === true && !weakSet.has(strongReffedItem);
    }
  },
  {
    description: 'Can not delete previously deleted item in non-empty WeakSet',
    run: function () {
      var weakSet = new WeakSet();
      weakSet.add(strongReffedItem);
      weakSet.add(anotherStrongReffedItem);
      weakSet.delete(strongReffedItem);
      return weakSet.delete(strongReffedItem) === false;
    }
  }
];

function runTest() {
  act.start();
  if (typeof WeakSet !== 'function') {
    act.fail('The WeakSet built-in object is not implemented on this device');
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
    act.fail('ECMAScript 6 WeakSet.prototype.delete() test failed - see log for details');
  }
}

loadSDK(runTest);
