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

var objectItem = {};
var stringItem = '2';

var tests = [
  {
    description: 'Constructed empty Set does not contain test items',
    run: function () {
      var set = new Set();
      return !set.has(objectItem) && !set.has(stringItem);
    }
  },
  {
    description: 'Constructed non-empty Set contains correct item',
    run: function () {
      var set = new Set([objectItem]);
      return set.has(objectItem) && !set.has(stringItem);
    }
  },
  {
    description: 'Constructed empty Set with item added contains correct item',
    run: function () {
      var set = new Set();
      set.add(objectItem);
      return set.has(objectItem) && !set.has(stringItem);
    }
  },
  {
    description: 'Constructed empty Set with same item added twice contains correct item',
    run: function () {
      var set = new Set();
      set.add(objectItem);
      set.add(objectItem);
      return set.has(objectItem) && !set.has(stringItem);
    }
  },
  {
    description:
      'Constructed empty Set with same item added and then deleted does not contain item',
    run: function () {
      var set = new Set();
      set.add(objectItem);
      set.delete(objectItem);
      return !set.has(objectItem) && !set.has(stringItem);
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
    act.fail(
      'ECMAScript 6 Set.prototype.add() and Set.prototype.has() test failed - see log for details'
    );
  }
}

loadSDK(runTest);
