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
    description: 'BinaryIntegerLiteral',
    test: `(function () {
      return 0B0101 === 5 &&
        0B11110001 === 241 &&
        0B101100001011 === 2827
    })()`
  },
  {
    description: 'OctalIntegerLiteral',
    test: `(function () {
      return 0O74 === 60 &&
        0O3143102 === 837186 &&
        0O76543210 === 16434824
    })()`
  },
  {
    description: 'HexIntegerLiteral',
    test: `(function () {
      return 0XF2e === 3886 &&
        0X2dF31 === 188209 &&
        0XabcAED5 === 180137685
    })()`
  }
];

function runTest() {
  act.start();

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
    act.fail('ECMAScript 6 numeric literals test failed - see log for details');
  }
}

loadSDK(runTest);
