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

var FLOAT_COMPARE_EPSILON = 1.1877e-7;
function floatCompare(a, b) {
  var diff = a - b;
  if (diff < 0) {
    diff = -diff;
  }
  return diff < FLOAT_COMPARE_EPSILON;
}

var tests = [
  {
    description: 'constants',
    run: function () {
      return (
        // eslint-disable-next-line no-loss-of-precision
        floatCompare(Math.E, 2.7182818284590452354) &&
        floatCompare(Math.LN2, 0.6931471805599453) &&
        floatCompare(Math.LN10, 2.302585092994046) &&
        floatCompare(Math.LOG2E, 1.4426950408889634) &&
        floatCompare(Math.LOG10E, 0.4342944819032518) &&
        // eslint-disable-next-line no-loss-of-precision
        floatCompare(Math.PI, 3.1415926535897932) &&
        floatCompare(Math.SQRT1_2, 0.7071067811865476) &&
        floatCompare(Math.SQRT2, 1.4142135623730951)
      );
    }
  },
  {
    description: 'abs',
    run: function () {
      return Math.abs(-2) === 2;
    }
  },
  {
    description: 'acos',
    run: function () {
      return floatCompare(Math.acos(0.5), 1.0471975511965979);
    }
  },
  {
    description: 'acosh',
    run: function () {
      return floatCompare(Math.acosh(2), 1.3169578969248166);
    }
  },
  {
    description: 'asin',
    run: function () {
      return floatCompare(Math.asin(-0.5), -0.5235987755982989);
    }
  },
  {
    description: 'asinh',
    run: function () {
      return floatCompare(Math.asinh(5), 2.3124383412727525);
    }
  },
  {
    description: 'atan',
    run: function () {
      return floatCompare(Math.atan(-3), -1.2490457723982544);
    }
  },
  {
    description: 'atan2',
    run: function () {
      return floatCompare(Math.atan2(3, 2), 0.982793723247329);
    }
  },
  {
    description: 'atanh',
    run: function () {
      return floatCompare(Math.atanh(0.3), 0.30951960420311175);
    }
  },
  {
    description: 'cbrt',
    run: function () {
      return Math.cbrt(8) === 2 && floatCompare(Math.cbrt(-27), -3);
    }
  },
  {
    description: 'ceil',
    run: function () {
      return Math.ceil(9.4) === 10;
    }
  },
  {
    description: 'clz32',
    run: function () {
      return Math.clz32(1000000) === 12;
    }
  },
  {
    description: 'cos',
    run: function () {
      return floatCompare(Math.cos(0.8), 0.6967067093471654);
    }
  },
  {
    description: 'cosh',
    run: function () {
      return floatCompare(Math.cosh(2), 3.7621956910836314);
    }
  },
  {
    description: 'exp',
    run: function () {
      return floatCompare(Math.exp(2), 7.38905609893065);
    }
  },
  {
    description: 'expm1',
    run: function () {
      return floatCompare(Math.expm1(0.2), 0.22140275816016985);
    }
  },
  {
    description: 'floor',
    run: function () {
      return Math.floor(2.8) === 2;
    }
  },
  {
    description: 'fround',
    run: function () {
      return Math.fround(3e12) === 3000000053248;
    }
  },
  {
    description: 'hypot',
    run: function () {
      return floatCompare(Math.hypot(2, 3, 4), 5.385164807134504);
    }
  },
  {
    description: 'imul',
    run: function () {
      return Math.imul(9e12, 7e3) === -1931902976;
    }
  },
  {
    description: 'log',
    run: function () {
      return floatCompare(Math.log(3), 1.0986122886681096);
    }
  },
  {
    description: 'log1p',
    run: function () {
      return floatCompare(Math.log1p(-0.5), -0.6931471805599453);
    }
  },
  {
    description: 'log2',
    run: function () {
      return Math.log2(16) === 4;
    }
  },
  {
    description: 'log10',
    run: function () {
      return Math.log10(100000) === 5;
    }
  },
  {
    description: 'max',
    run: function () {
      return Math.max(12, 5, 8) === 12;
    }
  },
  {
    description: 'min',
    run: function () {
      return Math.min(10, 2, 4) === 2;
    }
  },
  {
    description: 'pow',
    run: function () {
      return Math.pow(3, 4) === 81;
    }
  },
  {
    description: 'random',
    run: function () {
      var randomNumber = Math.random();
      return randomNumber >= 0 && randomNumber < 1;
    }
  },
  {
    description: 'round',
    run: function () {
      return (
        Math.round(3.49) === 3 &&
        Math.round(4.5001) === 5 &&
        Math.round(1.5) === 2 &&
        Math.round(-2.5) === -2
      );
    }
  },
  {
    description: 'sign',
    run: function () {
      return Math.sign(0) === 0 && Math.sign(-8) === -1 && Math.sign(3) === 1;
    }
  },
  {
    description: 'sin',
    run: function () {
      return floatCompare(Math.sin(0.5), 0.479425538604203);
    }
  },
  {
    description: 'sinh',
    run: function () {
      return floatCompare(Math.sinh(-0.2), -0.20133600254109402);
    }
  },
  {
    description: 'sqrt',
    run: function () {
      return Math.sqrt(16) === 4;
    }
  },
  {
    description: 'tan',
    run: function () {
      return floatCompare(Math.tan(2), -2.185039863261519);
    }
  },
  {
    description: 'tanh',
    run: function () {
      return floatCompare(Math.tanh(-3), -0.9950547536867305);
    }
  },
  {
    description: 'trunc',
    run: function () {
      return Math.trunc(42.84) === 42;
    }
  }
];

function runTest() {
  act.start();
  if (typeof Math === 'undefined') {
    act.fail('The Math object is not implemented on this device');
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
      act.log([test.description + ' test failed with error', error.message]);
      anyFailures = true;
    }
  }

  if (!anyFailures) {
    act.success();
  } else {
    act.fail('ECMAScript 6 Math object test failed - see log for details');
  }
}

loadSDK(runTest);
