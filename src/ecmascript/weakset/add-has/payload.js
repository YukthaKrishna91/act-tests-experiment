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

var itemOne = {};
var itemTwo = {};

var tests = [
  {
    description: 'Empty WeakSet does not contain test items',
    run: function () {
      var weakSet = new WeakSet();
      return !weakSet.has(itemOne) && !weakSet.has(itemTwo);
    }
  },
  {
    description: 'Non-empty WeakSet contains correct item',
    run: function () {
      var weakSet = new WeakSet();
      weakSet.add(itemOne);
      return weakSet.has(itemOne) && !weakSet.has(itemTwo);
    }
  },
  {
    description: 'WeakSet with same item set and then deleted does not contain item',
    run: function () {
      var weakSet = new WeakSet();
      weakSet.add(itemOne);
      weakSet.delete(itemOne);
      return !weakSet.has(itemOne) && !weakSet.has(itemTwo);
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
    act.fail('ECMAScript 6 Weakset add, has test failed - see log for details');
  }
}

loadSDK(runTest);
