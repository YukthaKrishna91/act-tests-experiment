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

function checkIteratorOutput(iterator, expectedOutput) {
  var result = true;

  for (var i = 0; result && i < expectedOutput.length; i++) {
    var nextItem = iterator.next();
    result = result && !nextItem.done;
    result = result && nextItem.value.toString() === expectedOutput[i].toString();
  }

  result = result && iterator.next().done;

  return result;
}

var tests = [
  {
    description: 'Constructed empty Set has no items',
    run: function () {
      return new Set().keys().next().done;
    }
  },
  {
    description: 'Constructed empty Set has no values',
    run: function () {
      return new Set().values().next().done;
    }
  },
  {
    description: 'Constructed empty Set has no entries',
    run: function () {
      return new Set().entries().next().done;
    }
  },
  {
    description: 'Constructed non-empty Set iterates items via keys() in order',
    run: function () {
      var set = new Set(['b', 'c', 'a']);
      return checkIteratorOutput(set.keys(), ['b', 'c', 'a']);
    }
  },
  {
    description: 'Constructed non-empty Set iterates items via values() in order',
    run: function () {
      var set = new Set(['b', 'c', 'a']);
      return checkIteratorOutput(set.values(), ['b', 'c', 'a']);
    }
  },
  {
    description: 'Constructed non-empty Set iterates items via entries() in order',
    run: function () {
      var set = new Set(['b', 'c', 'a']);
      return checkIteratorOutput(set.entries(), [
        ['b', 'b'],
        ['c', 'c'],
        ['a', 'a']
      ]);
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
    act.fail('ECMAScript 6 Set iteration test failed - see log for details');
  }
}

loadSDK(runTest);
