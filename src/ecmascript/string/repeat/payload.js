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
      'The str.repeat method takes an argument that specifies the number of times a string should be repeated.',
    run: function () {
      var hello = 'hello,';
      return hello.repeat(5) === 'hello,hello,hello,hello,hello,';
    }
  }
];

function runTest() {
  act.start();
  if (typeof String.prototype.repeat !== 'function') {
    act.fail('String.prototype.repeat() is not implemented on this device');
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
    act.fail('ECMAScript 6 String.prototype.repeat() test failed - see log for details');
  }
}

loadSDK(runTest);
