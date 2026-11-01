// Below taken from https://github.com/gre/bezier-easing/blob/master/src/index.js
// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;

var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

var float32ArraySupported = typeof Float32Array === 'function';

function A(aA1, aA2) {
  return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}
function B(aA1, aA2) {
  return 3.0 * aA2 - 6.0 * aA1;
}
function C(aA1) {
  return 3.0 * aA1;
}

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier(aT, aA1, aA2) {
  return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
}

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope(aT, aA1, aA2) {
  return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
}

function binarySubdivide(aX, aA, aB, mX1, mX2) {
  var currentX,
    currentT,
    i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
  for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
    var currentSlope = getSlope(aGuessT, mX1, mX2);
    if (currentSlope === 0.0) {
      return aGuessT;
    }
    var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
    aGuessT -= currentX / currentSlope;
  }
  return aGuessT;
}

function LinearEasing(x) {
  return x;
}

function bezier(mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }

  if (mX1 === mY1 && mX2 === mY2) {
    return LinearEasing;
  }

  // Precompute samples table
  var sampleValues = float32ArraySupported
    ? new Float32Array(kSplineTableSize)
    : new Array(kSplineTableSize);
  for (var i = 0; i < kSplineTableSize; ++i) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }

  function getTForX(aX) {
    var intervalStart = 0.0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    var dist =
      (aX - sampleValues[currentSample]) /
      (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;

    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing(x) {
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0 || x === 1) {
      return x;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
}

function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function sleep(delay) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, delay);
  });
}

function createBox() {
  var $box = document.createElement('div');
  $box.style.width = '100px';
  $box.style.height = '100px';
  $box.style.backgroundColor = '#ff0000';
  $box.style.position = 'absolute';
  return $box;
}
var animationCounter = 0;
function injectKeyframes(keyframes) {
  var $style = document.createElement('style');
  var animationId = 'Animation' + animationCounter++;
  var css = ['@keyframes ' + animationId + ' {', keyframes.join('\n'), '}'].join('\n');
  if ($style.styleSheet) {
    $style.styleSheet.cssText = css;
  } else {
    $style.appendChild(document.createTextNode(css));
  }
  document.head.appendChild($style);
  return animationId;
}

function roughlyEqual(current, expected, window2) {
  return current - window2 <= expected && current + window2 >= expected;
}
function clamp(input, min, max) {
  return Math.max(min, Math.min(max, input));
}

function validateTween(getCurrentValue, getExpectedValue, duration) {
  var allowedTimeBeforeFirstFrameMs = 400;
  var allowedDelayMs = 500;
  var record = function () {
    return new Promise(function (resolve) {
      var recording = [];
      var startTime = null;
      var onFrame = function (time) {
        if (!startTime) startTime = time;
        var timePassed = time - startTime;
        recording.push({ time: timePassed, value: getCurrentValue() });
        if (timePassed < duration + allowedDelayMs) {
          requestAnimationFrame(onFrame);
        } else {
          resolve(recording);
        }
      };
      requestAnimationFrame(onFrame);
    });
  };
  return record().then(function (recording) {
    var isGoodMatch = function (timeOffset) {
      return recording
        .map(function (entry) {
          return { time: entry.time - timeOffset, value: entry.value };
        })
        .filter(function (entry) {
          return entry.time >= 0 && entry.time < duration;
        })
        .every(function (entry) {
          return [-50, 0, 50].some(function (innerOffset) {
            var progress = clamp((entry.time - innerOffset) / duration, 0, 1);
            var expected = getExpectedValue(progress);
            var actual = entry.value;
            return roughlyEqual(actual, expected, 0.02);
          });
        });
    };
    for (var i = allowedTimeBeforeFirstFrameMs * -1; i <= allowedDelayMs; i += 5) {
      if (isGoodMatch(i)) {
        return true;
      }
    }
    return false;
  });
}

function run(config, type, interrupt) {
  if (interrupt && type === 'animation') {
    return Promise.reject(new Error('`interrupt` not supported for animations'));
  }
  var runAttempt = function () {
    return new Promise(function (resolve) {
      var transitionDuration = 500;
      var distance = interrupt ? 250 : 500;
      var $wrapper = document.createElement('div');
      $wrapper.style.width = '600px';
      $wrapper.style.height = '200px';
      $wrapper.style.position = 'relative';
      var $title = document.createElement('p');
      $title.style.position = 'relative';
      $title.style.width = '100%';
      $title.style.fontSize = '20px';
      $title.textContent = config.algo + ' ' + type + (interrupt ? ' interrupt' : '');
      $wrapper.appendChild($title);
      var $box = createBox();
      $box.style.left = '0';
      if (type === 'transition') {
        $box.style.transition = 'left ' + transitionDuration + 'ms ' + config.algo;
      } else if (type === 'animation') {
        var animationName = injectKeyframes([
          'from {',
          '  left: 0px',
          '}',
          'to {',
          '  left: ' + distance + 'px',
          '}'
        ]);
        $box.style.animation =
          animationName + ' ' + transitionDuration + 'ms ' + config.algo + ' 0s forwards 1';
        $box.style.animationPlayState = 'paused';
      } else {
        throw new Error('Unknown type');
      }
      $wrapper.appendChild($box);
      act.render($wrapper, function () {
        if (type === 'transition') {
          $box.offsetLeft;
          $box.style.left = distance + 'px';
        } else {
          $box.style.animationPlayState = 'running';
        }
        $box.offsetLeft;
        if (!interrupt) {
          resolve(
            validateTween(
              function () {
                return $box.offsetLeft / distance;
              },
              config.calculator,
              transitionDuration
            )
          );
        } else {
          var interruptPoint = 0.75 * transitionDuration;
          var interruptNewDistance = distance + 200;
          var part1Promise = validateTween(
            function () {
              return $box.offsetLeft / distance;
            },
            function (progress) {
              return config.calculator(progress * (interruptPoint / transitionDuration));
            },
            interruptPoint
          );
          var part2Promise = new Promise(function (_resolve) {
            setTimeout(function () {
              var newStartPosition = $box.offsetLeft;
              $box.style.left = interruptNewDistance + 'px';
              $box.offsetLeft;
              _resolve(
                validateTween(
                  function () {
                    return (
                      ($box.offsetLeft - newStartPosition) /
                      (interruptNewDistance - newStartPosition)
                    );
                  },
                  config.calculator,
                  transitionDuration
                )
              );
            }, interruptPoint);
          });
          resolve(
            Promise.all([part1Promise, part2Promise]).then(function (res) {
              return res[0] && res[1];
            })
          );
        }
      });
    });
  };
  var numAttempts = 3;
  var attempt = 0;
  return new Promise(function (resolve, reject) {
    var go = function () {
      attempt++;
      runAttempt()
        .catch(reject)
        .then(function (success) {
          if (success) {
            resolve(true);
            return;
          }
          if (attempt >= numAttempts) {
            resolve(false);
            return;
          }
          go();
        });
    };
    go();
  });
}

function runCurveTweenTest(type, interrupt) {
  var ease = bezier(0.25, 0.1, 0.25, 1);
  var easeIn = bezier(0.42, 0, 1, 1);
  var easeOut = bezier(0, 0, 0.58, 1);
  var easeInOut = bezier(0.42, 0, 0.58, 1);
  var customBezier = bezier(0.3, 0.1, 0.6, 0.15);

  var curveConfigs = [
    {
      algo: 'linear',
      calculator: function (progress) {
        return progress;
      }
    },
    {
      algo: 'ease',
      calculator: function (progress) {
        return ease(progress);
      }
    },
    {
      algo: 'ease-in',
      calculator: function (progress) {
        return easeIn(progress);
      }
    },
    {
      algo: 'ease-out',
      calculator: function (progress) {
        return easeOut(progress);
      }
    },
    {
      algo: 'ease-in-out',
      calculator: function (progress) {
        return easeInOut(progress);
      }
    },
    {
      algo: 'cubic-bezier(0.3, 0.1, 0.6, 0.15)',
      calculator: function (progress) {
        return customBezier(progress);
      }
    }
  ];
  act.start();
  var remaining = curveConfigs.slice(0);
  var failures = [];
  var next = function () {
    var config = remaining.shift();
    if (!config) {
      if (failures.length) {
        act.fail(
          'The box was not in the correct position throughout the ' +
            type +
            ' with the following algorithms: ' +
            failures.join(', ')
        );
      } else {
        act.success();
      }
      return;
    }
    return run(config, type, interrupt).then(function (passed) {
      if (!passed) {
        failures.push(config.algo);
      }
      return sleep(400).then(function () {
        return next();
      });
    });
  };
  next().catch(function (err) {
    act.error((err && err.message) || err || 'Something went wrong!');
  });
}

function runTest() {
  runCurveTweenTest('transition', true);
}

loadSDK(runTest);
