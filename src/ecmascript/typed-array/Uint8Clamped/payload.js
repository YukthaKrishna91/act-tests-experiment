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
      var Uint8 = new Uint8ClampedArray(2);
      Uint8[0] = 42;
      Uint8[1] = 22;
      return Uint8[0] === 42 && Uint8[1] === 22 && Uint8.length === 2;
    }
  },

  {
    description: 'constructed from an array',
    run: function () {
      var Uint8 = new Uint8ClampedArray([21, 254]);
      return Uint8[0] === 21 && Uint8[1] === 254 && Uint8.length === 2;
    }
  },

  {
    description: 'constructed from another typed array',
    run: function () {
      var Uint8x = new Uint8ClampedArray([21, 24]);
      var Uint8y = new Uint8ClampedArray(Uint8x);
      return Uint8y[0] === 21 && Uint8y[1] === 24 && Uint8y.length === 2;
    }
  },
  {
    description: 'array clamping behaves correctly',
    run: function () {
      var Uint8 = new Uint8ClampedArray(3);
      Uint8[0] = -10;
      Uint8[1] = 78;
      Uint8[2] = 300;
      return Uint8[0] === 0 && Uint8[1] === 78 && Uint8[2] === 255 && Uint8.length === 3;
    }
  },
  {
    description: 'constructed from an array buffer',
    run: function () {
      var buffer = new ArrayBuffer(8);
      var Uint8 = new Int8Array(buffer, 2, 4);
      return Uint8.length === 4;
    }
  },
  {
    description: 'of static method',
    run: function () {
      var Uint8 = Uint8ClampedArray.of('5', '6');
      return Uint8.length === 2 && Uint8[0] === 5 && Uint8[1] === 6;
    }
  },
  {
    description: 'from static method',
    run: function () {
      var Uint8 = Uint8ClampedArray.from('473845');
      return Uint8.length === 6 && Uint8[2] === 3 && Uint8[5] === 5;
    }
  }
];

function runTest() {
  act.start();
  if (typeof Uint8ClampedArray !== 'function') {
    act.fail('The Uint8ClampedArray is not implemented on this device');
    return;
  }

  if (typeof Uint8ClampedArray.of !== 'function') {
    act.fail('Uint8ClampedArray.of() is not implemented on this device');
    return;
  }

  if (typeof Uint8ClampedArray.from !== 'function') {
    act.fail('Uint8ClampedArray.from() is not implemented on this device');
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
    act.fail('ECMAScript 6 Uint8ClampedArray test failed - see log for details');
  }
}

loadSDK(runTest);
