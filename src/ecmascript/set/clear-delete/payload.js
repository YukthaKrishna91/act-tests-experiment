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
    description: 'Can not delete unknown item in empty Set',
    run: function () {
      var set = new Set();
      return set.delete('not-there') === false;
    }
  },
  {
    description: 'Can not delete unknown item in non-empty Set',
    run: function () {
      var set = new Set(['a']);
      return set.delete('not-there') === false && set.size === 1;
    }
  },
  {
    description: 'Can delete known item in non-empty Set',
    run: function () {
      var set = new Set(['a', 'b']);
      return set.delete('a') === true && set.size === 1;
    }
  },
  {
    description: 'Can not delete previously deleted item in non-empty Set',
    run: function () {
      var set = new Set(['a', 'b']);
      set.delete('a');
      return set.delete('a') === false && set.size === 1;
    }
  },
  {
    description: 'Can clear a non-empty Set',
    run: function () {
      var set = new Set(['a', 'b']);
      set.clear();
      return set.delete('a') === false && set.size === 0;
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
      'ECMAScript 6 Set.prototype.clear() and Set.prototype.delete() test failed - see log for details'
    );
  }
}

loadSDK(runTest);
