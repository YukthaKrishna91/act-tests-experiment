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
    description: 'constructed from a length',
    run: function () {
      var int8 = new Int8Array(2);
      int8[0] = 42;
      int8[1] = 22;
      return int8[0] === 42 && int8[1] === 22 && int8.length === 2;
    }
  },

  {
    description: 'constructed from an array',
    run: function () {
      var int8 = new Int8Array([-128, 127]);
      return int8[0] === -128 && int8[1] === 127 && int8.length === 2;
    }
  },

  {
    description: 'constructed from another typed array',
    run: function () {
      var int8x = new Int8Array([21, 24]);
      var int8y = new Int8Array(int8x);
      return int8y[0] === 21 && int8y[1] === 24 && int8y.length === 2;
    }
  },

  {
    description: 'constructed from an array buffer',
    run: function () {
      var buffer = new ArrayBuffer(8);
      var int8 = new Int8Array(buffer, 2, 4);
      return int8.length === 4;
    }
  },
  {
    description: 'of static method',
    run: function () {
      var int8 = Int8Array.of('5', '6');
      return int8.length === 2 && int8[0] === 5 && int8[1] === 6;
    }
  },
  {
    description: 'from static method',
    run: function () {
      var int8 = Int8Array.from('473845');
      return int8.length === 6 && int8[2] === 3 && int8[5] === 5;
    }
  }
];

function runTest() {
  act.start();
  if (typeof Int8Array !== 'function') {
    act.fail('The Int8Array is not implemented on this device');
    return;
  }

  if (typeof Int8Array.of !== 'function') {
    act.fail('Int8Array.of() is not implemented on this device');
    return;
  }

  if (typeof Int8Array.from !== 'function') {
    act.fail('Int8Array.from() is not implemented on this device');
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
    act.fail('ECMAScript 6 Int8Array test failed - see log for details');
  }
}

loadSDK(runTest);
