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
    description: 'Constructed empty Map has no keys',
    run: function () {
      return new Map().keys().next().done;
    }
  },
  {
    description: 'Constructed empty Map has no values',
    run: function () {
      return new Map().values().next().done;
    }
  },
  {
    description: 'Constructed empty Map has no entries',
    run: function () {
      return new Map().entries().next().done;
    }
  },
  {
    description: 'Constructed non-empty Map iterates keys in order',
    run: function () {
      var map = new Map([
        ['b', 456],
        ['c', 789],
        ['a', 123]
      ]);
      return checkIteratorOutput(map.keys(), ['b', 'c', 'a']);
    }
  },
  {
    description: 'Constructed non-empty Map iterates values in order',
    run: function () {
      var map = new Map([
        ['b', 456],
        ['c', 789],
        ['a', 123]
      ]);
      return checkIteratorOutput(map.values(), [456, 789, 123]);
    }
  },
  {
    description: 'Constructed non-empty Map iterates entries in order',
    run: function () {
      var map = new Map([
        ['b', 456],
        ['c', 789],
        ['a', 123]
      ]);
      return checkIteratorOutput(map.entries(), [
        ['b', 456],
        ['c', 789],
        ['a', 123]
      ]);
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
    act.fail('ECMAScript 6 Map iteration test failed - see log for details');
  }
}

loadSDK(runTest);
