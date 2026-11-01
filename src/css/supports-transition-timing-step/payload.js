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
function run(config, type2, interrupt) {
  if (interrupt && type2 === 'animation') {
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
      $title.textContent = config.algo + ' ' + type2 + (interrupt ? ' interrupt' : '');
      $wrapper.appendChild($title);
      var $box = createBox();
      $box.style.left = '0';
      if (type2 === 'transition') {
        $box.style.transition = 'left ' + transitionDuration + 'ms ' + config.algo;
      } else if (type2 === 'animation') {
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
        if (type2 === 'transition') {
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

function runStepTweenTest(type2, interrupt) {
  var calculateStep = function (stepCount, stepPosition, progress) {
    var step = Math.floor(progress * stepCount);
    return (stepPosition === 'jump-start' ? Math.min(stepCount, step + 1) : step) / stepCount;
  };
  var stepConfigs = [
    {
      algo: 'step-start',
      calculator: function () {
        return 1;
      }
    },
    {
      algo: 'step-end',
      calculator: function (progress) {
        return progress !== 1 ? 0 : 1;
      }
    },
    {
      algo: 'steps(2)',
      calculator: function (progress) {
        return calculateStep(2, 'jump-end', progress);
      }
    },
    {
      algo: 'steps(2, end)',
      calculator: function (progress) {
        return calculateStep(2, 'jump-end', progress);
      }
    },
    {
      algo: 'steps(2, jump-end)',
      calculator: function (progress) {
        return calculateStep(2, 'jump-end', progress);
      }
    },
    {
      algo: 'steps(2, start)',
      calculator: function (progress) {
        return calculateStep(2, 'jump-start', progress);
      }
    },
    {
      algo: 'steps(2, jump-start)',
      calculator: function (progress) {
        return calculateStep(2, 'jump-start', progress);
      }
    },
    {
      algo: 'steps(3)',
      calculator: function (progress) {
        return calculateStep(3, 'jump-end', progress);
      }
    },
    {
      algo: 'steps(2, jump-both)',
      calculator: function (progress) {
        if (progress === 1) {
          return 3 / 3;
        } else if (progress >= 0.5) {
          return 2 / 3;
        } else {
          return 1 / 3;
        }
      }
    },
    {
      algo: 'steps(2, jump-none)',
      calculator: function (progress) {
        return progress >= 0.5 ? 1 : 0;
      }
    }
  ];
  act.start();
  var remaining = stepConfigs.slice(0);
  var failures = [];
  var next = function () {
    var config = remaining.shift();
    if (!config) {
      if (failures.length) {
        act.fail(
          'The box was not in the correct position throughout the ' +
            type2 +
            ' with the following algorithms: ' +
            failures.join(', ')
        );
      } else {
        act.success();
      }
      return;
    }
    return run(config, type2, interrupt).then(function (passed) {
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
  runStepTweenTest('transition');
}

loadSDK(runTest);
