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
      var float32Array = new Float32Array(2);
      float32Array[0] = 1.48;
      float32Array[1] = 2.53;
      return (
        float32Array[0].toFixed(5) === '1.48000' &&
        float32Array[1].toFixed(5) === '2.53000' &&
        float32Array.length === 2
      );
    }
  },

  {
    description: 'constructed from an array',
    run: function () {
      var float32Array = new Float32Array([2.45, 2.56]);
      return (
        float32Array[0].toFixed(5) === '2.45000' &&
        float32Array[1].toFixed(5) === '2.56000' &&
        float32Array.length === 2
      );
    }
  },

  {
    description: 'constructed from another typed array',
    run: function () {
      var float32x = new Float32Array([1.55, 4.55]);
      var float32y = new Float32Array(float32x);
      return (
        float32y[0].toFixed(5) === '1.55000' &&
        float32y[1].toFixed(5) === '4.55000' &&
        float32y.length === 2
      );
    }
  },
  {
    description: 'constructed from an array buffer',
    run: function () {
      var buffer = new ArrayBuffer(40);
      var float32 = new Float32Array(buffer, 4, 8);
      return float32.length === 8;
    }
  },
  {
    description: 'of static method',
    run: function () {
      var float32 = Float32Array.of('5.8', '6.2');
      return (
        float32.length === 2 &&
        float32[0].toFixed(3) === '5.800' &&
        float32[1].toFixed(3) === '6.200'
      );
    }
  },
  {
    description: 'from static method',
    run: function () {
      var float32 = Float32Array.from('4738');
      return float32.length === 4 && float32[2] === 3 && float32[3] === 8;
    }
  }
];
function runTest() {
  act.start();
  if (typeof Float32Array !== 'function') {
    act.fail('The Float32Array is not implemented on this device');
    return;
  }

  if (typeof Float32Array.of !== 'function') {
    act.fail('Float32Array.of() is not implemented on this device');
    return;
  }

  if (typeof Float32Array.from !== 'function') {
    act.fail('Float32Array.from() is not implemented on this device');
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
    act.fail('ECMAScript 6 Float32Array test failed - see log for details');
  }
}

loadSDK(runTest);
