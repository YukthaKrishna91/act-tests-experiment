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
    description: 'Can not delete unknown key in empty Map',
    run: function () {
      var map = new Map();
      return map.delete('not-there') === false;
    }
  },
  {
    description: 'Can not delete unknown key in non-empty Map',
    run: function () {
      var map = new Map([['a', 1]]);
      return map.delete('not-there') === false && map.size === 1;
    }
  },
  {
    description: 'Can delete known key in non-empty Map',
    run: function () {
      var map = new Map([
        ['a', 1],
        ['b', 2]
      ]);
      return map.delete('a') === true && map.size === 1;
    }
  },
  {
    description: 'Can not delete previously deleted key in non-empty Map',
    run: function () {
      var map = new Map([
        ['a', 1],
        ['b', 2]
      ]);
      map.delete('a');
      return map.delete('a') === false && map.size === 1;
    }
  },
  {
    description: 'Can clear a non-empty Map',
    run: function () {
      var map = new Map([
        ['a', 1],
        ['b', 2]
      ]);
      map.clear();
      return map.delete('a') === false && map.size === 0;
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
    act.fail('ECMAScript 6 Map clear()/delete() test failed - see log for details');
  }
}

loadSDK(runTest);
