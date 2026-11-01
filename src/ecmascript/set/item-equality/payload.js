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
    description: 'NaN equals NaN in Set item comparisons',
    run: function () {
      var set = new Set([NaN]);
      return set.has(NaN);
    }
  },
  {
    description: '+0 equals -0 in Set item comparisons',
    run: function () {
      var set = new Set([+0]);
      return set.has(-0);
    }
  },
  {
    description: '-0 equals +0 in Set item comparisons',
    run: function () {
      var set = new Set([-0]);
      return set.has(+0);
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
    act.fail('ECMAScript 6 Set item equality test failed - see log for details');
  }
}

loadSDK(runTest);
