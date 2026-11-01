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
    description: 'Constructed empty Map has size 0',
    run: function () {
      return new Map().size === 0;
    }
  },
  {
    description: 'Constructed non-empty Map has correct size',
    run: function () {
      return (
        new Map([
          ['a', 1],
          ['b', 2]
        ]).size === 2
      );
    }
  },
  {
    description: 'Map has size 1 after one key set',
    run: function () {
      return new Map().set('a', 1).size === 1;
    }
  },
  {
    description: 'Map has size 2 after two keys set',
    run: function () {
      return new Map().set('a', 1).set('b', 2).size === 2;
    }
  },
  {
    description: 'Map has size 1 after one key set twice',
    run: function () {
      return new Map().set('a', 1).set('a', 2).size === 1;
    }
  },
  {
    description: 'Map has size 1 after two keys set and one deleted',
    run: function () {
      var map = new Map();
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');
      return map.size === 1;
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
    act.fail('ECMAScript 6 Map size() test failed - see log for details');
  }
}

loadSDK(runTest);
