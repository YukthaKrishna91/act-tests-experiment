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
      var int16 = new Int16Array(2);
      int16[0] = 35;
      int16[1] = 78;
      return int16[0] === 35 && int16[1] === 78 && int16.length === 2;
    }
  },

  {
    description: 'constructed from an array',
    run: function () {
      var int16 = new Int16Array([-32768, 32767]);
      return int16[0] === -32768 && int16[1] === 32767 && int16.length === 2;
    }
  },

  {
    description: 'constructed from another typed array',
    run: function () {
      var int16x = new Int16Array([21, 24]);
      var int16y = new Int16Array(int16x);
      return int16y[0] === 21 && int16y[1] === 24 && int16y.length === 2;
    }
  },

  {
    description: 'constructed from an array buffer',
    run: function () {
      var buffer = new ArrayBuffer(10);
      var int16 = new Int16Array(buffer, 2, 4);
      return int16.length === 4;
    }
  },
  {
    description: 'of static method',
    run: function () {
      var int16 = Int16Array.of('7', '6');
      return int16.length === 2 && int16[0] === 7 && int16[1] === 6;
    }
  },
  {
    description: 'from static method',
    run: function () {
      var int16 = Int16Array.from('4738458');
      return int16.length === 7 && int16[2] === 3 && int16[6] === 8;
    }
  }
];

function runTest() {
  act.start();

  if (typeof Int16Array !== 'function') {
    act.fail('The Int16Array is not implemented on this device');
    return;
  }

  if (typeof Int16Array.of !== 'function') {
    act.fail('Int16Array.of() is not implemented on this device');
    return;
  }

  if (typeof Int16Array.from !== 'function') {
    act.fail('Int16Array.from() is not implemented on this device');
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
    act.fail('ECMAScript 6 Int16Array test failed - see log for details');
  }
}

loadSDK(runTest);
