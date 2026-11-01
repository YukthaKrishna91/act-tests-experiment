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
      var Uint16 = new Uint16Array(2);
      Uint16[0] = 35;
      Uint16[1] = 78;
      return Uint16[0] === 35 && Uint16[1] === 78 && Uint16.length === 2;
    }
  },

  {
    description: 'constructed from an array',
    run: function () {
      var Uint16 = new Uint16Array([0, 65535]);
      return Uint16[0] === 0 && Uint16[1] === 65535 && Uint16.length === 2;
    }
  },

  {
    description: 'does not allow integers out of range',
    run: function () {
      var Uint16 = new Uint16Array(3);
      Uint16[0] = 35;
      Uint16[1] = 78;
      Uint16[2] = 65536;
      return Uint16[2] !== 65536 && Uint16.length === 3;
    }
  },

  {
    description: 'constructed from another typed array',
    run: function () {
      var Uint16x = new Uint16Array([21, 24]);
      var Uint16y = new Uint16Array(Uint16x);
      return Uint16y[0] === 21 && Uint16y[1] === 24 && Uint16y.length === 2;
    }
  },

  {
    description: 'constructed from an array buffer',
    run: function () {
      var buffer = new ArrayBuffer(10);
      var Uint16 = new Uint16Array(buffer, 2, 4);
      return Uint16.length === 4;
    }
  },

  {
    description: 'of static method',
    run: function () {
      var Uint16 = Uint16Array.of('7', '6');
      return Uint16.length === 2 && Uint16[0] === 7 && Uint16[1] === 6;
    }
  },

  {
    description: 'from static method',
    run: function () {
      var Uint16 = Uint16Array.from('4738458');
      return Uint16.length === 7 && Uint16[2] === 3 && Uint16[6] === 8;
    }
  }
];

function runTest() {
  act.start();
  if (typeof Int16Array !== 'function') {
    act.fail('The Uint16Array is not implemented on this device');
    return;
  }

  if (typeof Uint16Array.of !== 'function') {
    act.fail('Uint16Array.of() is not implemented on this device');
    return;
  }

  if (typeof Uint16Array.from !== 'function') {
    act.fail('Uint16Array.from() is not implemented on this device');
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
    act.fail('ECMAScript 6 Uint16Array test failed - see log for details');
  }
}

loadSDK(runTest);
