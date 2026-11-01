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
      var int32 = new Int32Array(2);
      int32[0] = 42;
      int32[1] = 22;
      return int32[0] === 42 && int32[1] === 22 && int32.length === 2;
    }
  },

  {
    description: 'constructed from an array',
    run: function () {
      var int32 = new Int32Array([-2147483648, 2147483647]);
      return int32[0] === -2147483648 && int32[1] === 2147483647 && int32.length === 2;
    }
  },

  {
    description: 'constructed from another typed array',
    run: function () {
      var int32x = new Int32Array([21, 24]);
      var int32y = new Int32Array(int32x);
      return int32y[0] === 21 && int32y[1] === 24 && int32y.length === 2;
    }
  },

  {
    description: 'constructed from an array buffer',
    run: function () {
      var buffer = new ArrayBuffer(40);
      var int32 = new Int32Array(buffer, 4, 8);
      return int32.length === 8;
    }
  },
  {
    description: 'of static method',
    run: function () {
      var int32 = Int32Array.of('5', '6');
      return int32.length === 2 && int32[0] === 5 && int32[1] === 6;
    }
  },
  {
    description: 'from static method',
    run: function () {
      var int32 = Int32Array.from('473845');
      return int32.length === 6 && int32[2] === 3 && int32[5] === 5;
    }
  }
];

function runTest() {
  act.start();
  if (typeof Int32Array !== 'function') {
    act.fail('The Int32Array is not implemented on this device');
    return;
  }

  if (typeof Int32Array.of !== 'function') {
    act.fail('Int32Array.of() is not implemented on this device');
    return;
  }

  if (typeof Int32Array.from !== 'function') {
    act.fail('Int32Array.from() is not implemented on this device');
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
    act.fail('ECMAScript 6 Int32Array test failed - see log for details');
  }
}

loadSDK(runTest);
