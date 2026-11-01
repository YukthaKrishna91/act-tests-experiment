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
      var Uint32 = new Uint32Array(2);
      Uint32[0] = 42;
      Uint32[1] = 22;
      return Uint32[0] === 42 && Uint32[1] === 22 && Uint32.length === 2;
    }
  },

  {
    description: 'constructed from an array',
    run: function () {
      var Uint32 = new Uint32Array([21, 28]);
      return Uint32[0] === 21 && Uint32[1] === 28 && Uint32.length === 2;
    }
  },

  {
    description: 'constructed from another typed array',
    run: function () {
      var Uint32x = new Uint32Array([0, 4294967295]);
      var Uint32y = new Uint32Array(Uint32x);
      return Uint32y[0] === 0 && Uint32y[1] === 4294967295 && Uint32y.length === 2;
    }
  },

  {
    description: 'does not allow integers out of range',
    run: function () {
      var Uint32 = new Uint32Array(3);
      Uint32[0] = 35;
      Uint32[1] = 78;
      Uint32[2] = 4294967296;
      return Uint32[2] !== 4294967296 && Uint32.length === 3;
    }
  },

  {
    description: 'constructed from an array buffer',
    run: function () {
      var buffer = new ArrayBuffer(40);
      var Uint32 = new Uint32Array(buffer, 4, 8);
      return Uint32.length === 8;
    }
  },
  {
    description: 'of static method',
    run: function () {
      var Uint32 = Uint32Array.of('5', '6');
      return Uint32.length === 2 && Uint32[0] === 5 && Uint32[1] === 6;
    }
  },
  {
    description: 'from static method',
    run: function () {
      var Uint32 = Uint32Array.from('473845');
      return Uint32.length === 6 && Uint32[2] === 3 && Uint32[5] === 5;
    }
  }
];

function runTest() {
  act.start();
  if (typeof Uint32Array !== 'function') {
    act.fail('The Uint32Array is not implemented on this device');
    return;
  }

  if (typeof Uint32Array.of !== 'function') {
    act.fail('Uint32Array.of() is not implemented on this device');
    return;
  }

  if (typeof Uint32Array.from !== 'function') {
    act.fail('Uint32Array.from() is not implemented on this device');
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
    act.fail('ECMAScript 6 Uint32Array test failed - see log for details');
  }
}

loadSDK(runTest);
