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
    description: 'Array.prototype.entries() iterating with index and element',
    test: `(function() {
        var array = ['a', 'b', 'c']
        var result = ''
        for (var [index, element] of array.entries()) {
          result += String(index) + element
        }
        return result === '0a1b2c'
      })()
    `
  },
  {
    description: 'Array.prototype.entries() using a for...of loop',
    test: `(function() {
        var array = ['a', 'b', 'c']
        var result = ''
        for (var entry of array.entries()) {
          result += String(entry[0]) + entry[1]
        }
        return result === '0a1b2c'
      })()
    `
  }
];

function runTest() {
  act.start();
  if (typeof Array.prototype.entries !== 'function') {
    act.fail('Array.prototype.entries() is not implemented on this device');
    return;
  }

  var anyFailures = false;

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    try {
      var success = eval(test.test);
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
    act.fail('ECMAScript 6 array.prototype.entries test failed - see log for details');
  }
}

loadSDK(runTest);
