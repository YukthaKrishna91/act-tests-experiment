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
    description: 'NaN equals NaN in Map key comparisons',
    run: function () {
      var map = new Map([[NaN, 'abc']]);
      map.set(NaN, 'def');
      return map.get(NaN) === 'def';
    }
  },
  {
    description: '+0 equals -0 in Map key comparisons',
    run: function () {
      var map = new Map([[+0, 'abc']]);
      map.set(-0, 'def');
      return map.get(+0) === 'def';
    }
  }
];

function runTest() {
  act.start();
  if (typeof Map !== 'function') {
    act.fail('The Map built-in object is not implemented on this device');
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
    act.fail('ECMAScript 6 Map key equality test failed - see log for details');
  }
}

loadSDK(runTest);
