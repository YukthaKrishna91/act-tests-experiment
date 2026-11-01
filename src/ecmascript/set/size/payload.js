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
    description: 'Constructed empty Set has size 0',
    run: function () {
      return new Set().size === 0;
    }
  },
  {
    description: 'Constructed non-empty Set has correct size',
    run: function () {
      return new Set(['a', 'b']).size === 2;
    }
  },
  {
    description: 'Set has size 1 after one item added',
    run: function () {
      return new Set().add('a').size === 1;
    }
  },
  {
    description: 'Set has size 2 after two items added',
    run: function () {
      return new Set().add('a').add('b').size === 2;
    }
  },
  {
    description: 'Set has size 1 after one item added twice',
    run: function () {
      return new Set().add('a').add('a').size === 1;
    }
  },
  {
    description: 'Set has size 1 after two items added and one deleted',
    run: function () {
      var set = new Set();
      set.add('a');
      set.add('b');
      set.delete('a');
      return set.size === 1;
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
    act.fail('ECMAScript 6 Set.prototype.size test failed - see log for details');
  }
}

loadSDK(runTest);
