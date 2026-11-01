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
    description:
      'If you call Object.getOwnPropertySymbols(), the array returned contains only symbols that define properties on that object.',
    run: function () {
      var localSymbol = Symbol('A local symbol');
      var globalSymbol = Symbol.for('A global symbol');

      var examined = {};
      examined['a'] = 'non-symbol property that should not be returned';
      examined[localSymbol] = 'a (local) symbol property';
      examined[globalSymbol] = 'a (global) symbol property';

      var examinedObjectSymbols = Object.getOwnPropertySymbols(examined);

      return (
        examinedObjectSymbols.length === 2 &&
        examinedObjectSymbols.indexOf(localSymbol) !== -1 &&
        examinedObjectSymbols.indexOf(globalSymbol) !== -1
      );
    }
  }
];

function runTest() {
  act.start();
  if (typeof Object.getOwnPropertySymbols !== 'function') {
    act.fail('Object.getOwnPropertySymbols() is not implemented on this device');
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
      act.log([test.description + ' test error', error.message]);
      anyFailures = true;
    }
  }

  if (!anyFailures) {
    act.success();
  } else {
    act.fail('ECMAScript 6 Object.getOwnPropertySymbols() test failed - see log for details');
  }
}

loadSDK(runTest);
