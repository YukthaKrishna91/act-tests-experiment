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
      var float64Array = new Float64Array(2);
      float64Array[0] = 1.48;
      float64Array[1] = 2.53;
      return (
        float64Array[0].toFixed(5) === '1.48000' &&
        float64Array[1].toFixed(5) === '2.53000' &&
        float64Array.length === 2
      );
    }
  },

  {
    description: 'constructed from an array',
    run: function () {
      var float64Array = new Float64Array([2.45, 2.56]);
      return (
        float64Array[0].toFixed(5) === '2.45000' &&
        float64Array[1].toFixed(5) === '2.56000' &&
        float64Array.length === 2
      );
    }
  },

  {
    description: 'constructed from another typed array',
    run: function () {
      var float64x = new Float64Array([1.55, 4.55]);
      var float64y = new Float64Array(float64x);
      return (
        float64y[0].toFixed(5) === '1.55000' &&
        float64y[1].toFixed(5) === '4.55000' &&
        float64y.length === 2
      );
    }
  },

  {
    description: 'constructed from an array buffer',
    run: function () {
      var buffer = new ArrayBuffer(40);
      var float64 = new Float64Array(buffer, 0, 5);
      return float64.length === 5;
    }
  },
  {
    description: 'of static method',
    run: function () {
      var float64 = Float64Array.of('5.8', '6.2');
      return (
        float64.length === 2 &&
        float64[0].toFixed(3) === '5.800' &&
        float64[1].toFixed(3) === '6.200'
      );
    }
  },
  {
    description: 'from static method',
    run: function () {
      var float64 = Float64Array.from('4738');
      return float64.length === 4 && float64[2] === 3 && float64[3] === 8;
    }
  }
];
function runTest() {
  act.start();
  if (typeof Float64Array !== 'function') {
    act.fail('The Float64Array is not implemented on this device');
    return;
  }

  if (typeof Float64Array.of !== 'function') {
    act.fail('Float64Array.of() is not implemented on this device');
    return;
  }

  if (typeof Float64Array.from !== 'function') {
    act.fail('Float64Array.from() is not implemented on this device');
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
    act.fail('ECMAScript 6 Float64Array test failed - see log for details');
  }
}

loadSDK(runTest);
