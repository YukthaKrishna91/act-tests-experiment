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

var testCases = [
  {
    description: '16-bit Unicode escaped identifier',
    test: `
      (function(){
        var object = { abc\u0B85def: 'xyz' }
        var objectKey = Object.keys(object)[0]
        return object.abc\u0B85def === 'xyz' &&
          objectKey.length === 7 &&
          objectKey[3] === '\u0B85'
      })()
    `
  },
  {
    description: '16-bit Unicode code point escaped string literal',
    test: `
      (function(){
        var object = { abc\u{0B85}def: 'xyz' }
        var objectKey = Object.keys(object)[0]
        return object.abc\u{0B85}def === 'xyz' &&
          objectKey.length === 7 &&
          objectKey[3] === '\u{0B85}'
      })()
    `
  }
];

function runTest() {
  act.start();
  var anyFailures = false;
  var test, success;

  for (var i = 0; i < testCases.length; i++) {
    test = testCases[i];

    try {
      success = eval(test.test);
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
    act.fail('ECMAScript 6 Unicode identifiers test failed - see log for details');
  }
}

loadSDK(runTest);
