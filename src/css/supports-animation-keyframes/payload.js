function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function roughlyEqual(current, expected, window) {
  return current - window <= expected && current + window >= expected;
}

function clamp(input, min, max) {
  return Math.max(min, Math.min(max, input));
}

function validateTween(getCurrentValue, getExpectedValue, duration) {
  // the time that the transition is allowed to start before the first frame arrives
  var allowedTimeBeforeFirstFrameMs = 400;
  // the time after `allowedTimeBeforeFirstFrameMs` that the transition start is allowed to be delayed by
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
          window.requestAnimationFrame(onFrame);
        } else {
          resolve(recording);
        }
      };
      window.requestAnimationFrame(onFrame);
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
          // allow each frame to be slightly off independently of other frames
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

function runTest() {
  act.start();

  var $box = createBox();

  var animationName = injectKeyframes([
    '0% {',
    '  left: 0px;',
    '}',
    '40% {',
    '  left: 100px;',
    '}',
    '100% {',
    '  left: 20px;',
    '}'
  ]);

  var duration = 1000;
  $box.style.animation = animationName + ' ' + duration + 'ms linear 0s forwards 1';
  $box.style.animationPlayState = 'paused';

  act.render($box, function () {
    $box.style.animationPlayState = 'running';
    // ensure the animation starts right now

    $box.offsetLeft;

    var getCurrentValue = function () {
      return $box.offsetLeft / 100;
    };

    var getExpectedValue = function (progress) {
      var segmentDuration;
      if (progress < 0.4) {
        segmentDuration = 0.4;
        return progress / segmentDuration;
      } else if (progress < 1) {
        var timeIntoSegment = progress - 0.4;
        segmentDuration = 0.6;
        return 1 - 0.8 * (timeIntoSegment / segmentDuration);
      } else {
        return 0.2;
      }
    };

    validateTween(getCurrentValue, getExpectedValue, duration)
      .then(function (passed) {
        passed ? act.success() : act.fail('CSS animation keyframes do not work accurately.');
      })
      .catch(function (err) {
        act.error((err && err.message) || err || 'Something went wrong!');
      });
  });
}

loadSDK(runTest);
