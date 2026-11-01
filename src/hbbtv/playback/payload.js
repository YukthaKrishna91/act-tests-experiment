function loadSDK(callback) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var testConfiguration = {
  readinessTimeoutMs: 5000,
  readinessPollIntervalMs: 250
};

var testMessages = {
  title: 'Broadcast Playback Play State',
  screenInstructions:
    'Look at the test portal for instructions. Use your remote control to pause and resume the broadcast when prompted in the portal.',
  waitingForBroadcast: 'Waiting for the broadcast object to become ready...',
  pauseOnScreen: 'Step 1: Press PAUSE on your remote, then click Continue in the ACT portal.',
  resumeOnScreen: 'Step 2: Press PLAY on your remote, then click Continue in the ACT portal.',
  pausePrompt:
    'Press the PAUSE button on your remote control to pause the broadcast, then click Continue.',
  resumePrompt:
    'Pause event detected correctly. Now press PLAY to resume the broadcast, then click Continue.'
};

var screenStyles = {
  container:
    'display: table; width: 100%; height: 100%; background: transparent; color: white; font-family: sans-serif;',
  cell: 'display: table-cell; vertical-align: middle; padding: 24px; text-align: center;',
  stage:
    'display: inline-block; width: 900px; max-width: 100%; padding: 26px 30px; ' +
    'background-color: rgba(7,15,24,0.6); border: 1px solid rgba(255,255,255,0.22); ' +
    'border-radius: 18px; box-shadow: 0 18px 40px rgba(0,0,0,0.28); text-align: left;',
  title:
    'display: inline-block; margin: 0 0 12px; padding: 6px 10px; ' +
    'background-color: rgba(255,255,255,0.22); color: white; font-size: 22px; ' +
    'border: 1px solid rgba(255,255,255,0.3); border-radius: 10px;',
  paragraph:
    'display: block; margin: 0 0 10px; padding: 8px 10px; ' +
    'background-color: rgba(255,255,255,0.92); color: rgb(24,24,24); font-size: 16px; ' +
    'line-height: 1.4; border-radius: 8px; border: 1px solid rgba(7,15,24,0.12);'
};

var onScreenStepElement = null;

function formatValue(value) {
  if (typeof value === 'undefined') {
    return 'undefined';
  }

  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return "'" + value + "'";
  }

  if (Array.isArray(value)) {
    return '[' + value.map(formatValue).join(', ') + ']';
  }

  if (typeof value === 'object') {
    return '{}';
  }

  return String(value);
}

function readValue(getter) {
  try {
    return {
      value: getter(),
      error: null
    };
  } catch (error) {
    return {
      value: error && error.message ? error.message : 'Unable to read value',
      error: error || true
    };
  }
}

function isBroadcastVideoObject(element) {
  return (
    !!element &&
    typeof element.type === 'string' &&
    element.type.toLowerCase() === 'video/broadcast'
  );
}

function getVideoObject() {
  var videoObject = document.getElementById('videoBroadcast');

  if (isBroadcastVideoObject(videoObject)) {
    return videoObject;
  }

  return null;
}

function logVideoObjectState(videoObject) {
  act.log('currentTimeShiftMode: ' + formatValue(videoObject.currentTimeShiftMode));
  act.log('playbackOffset: ' + formatValue(videoObject.playbackOffset));
  act.log('playPosition: ' + formatValue(videoObject.playPosition));
  act.log('playSpeed: ' + formatValue(videoObject.playSpeed));
}

function capturePlaybackState(videoObject) {
  return {
    playbackOffset: videoObject.playbackOffset,
    playPosition: videoObject.playPosition,
    playSpeed: videoObject.playSpeed
  };
}

function createElement(tagName, cssText, text) {
  var element = document.createElement(tagName);
  element.style.cssText = cssText;

  if (typeof text === 'string') {
    element.textContent = text;
  }

  return element;
}

function createInstructionScreen() {
  var container = createElement('div', screenStyles.container);
  var cell = createElement('div', screenStyles.cell);
  var stage = createElement('div', screenStyles.stage);
  var title = createElement('h2', screenStyles.title, testMessages.title);
  var instructions = createElement('p', screenStyles.paragraph, testMessages.screenInstructions);
  onScreenStepElement = createElement(
    'p',
    screenStyles.paragraph,
    testMessages.waitingForBroadcast
  );

  stage.appendChild(title);
  stage.appendChild(instructions);
  stage.appendChild(onScreenStepElement);
  cell.appendChild(stage);
  container.appendChild(cell);

  return container;
}

function updateOnScreenStep(message) {
  if (onScreenStepElement) {
    onScreenStepElement.textContent = message;
  }
}

function waitForBroadcast(onReady, onTimeout) {
  var deadline = Date.now() + testConfiguration.readinessTimeoutMs;

  function poll() {
    var videoObject = getVideoObject();

    if (videoObject) {
      var channelResult = readValue(function () {
        return videoObject.currentChannel;
      });

      if (!channelResult.error && channelResult.value) {
        onReady(videoObject);
        return;
      }
    }

    if (Date.now() >= deadline) {
      onTimeout();
      return;
    }

    setTimeout(poll, testConfiguration.readinessPollIntervalMs);
  }

  poll();
}

function askUserToPause(videoObject) {
  var pauseData = null;

  updateOnScreenStep(testMessages.pauseOnScreen);

  videoObject.onPlaySpeedChanged = function (speed) {
    act.log('PlaySpeed Change detected: ' + formatValue(speed));
    logVideoObjectState(videoObject);

    if (speed === 0 && pauseData === null) {
      pauseData = capturePlaybackState(videoObject);
      pauseData.playSpeed = speed; // Store the speed at the time of the callback
    }
  };

  act
    .ask(testMessages.pausePrompt)
    .addButton('Continue', true, 'primary')
    .send(function () {
      videoObject.onPlaySpeedChanged = null;

      if (!pauseData) {
        act.fail(
          'No onPlaySpeedChanged event was detected. ' +
            'The broadcast may not have been paused, or the event was not fired by the user agent.'
        );
        return;
      }

      if (pauseData.playSpeed !== 0) {
        act.fail(
          'Expected playSpeed to be 0 after pausing, but got ' + formatValue(pauseData.playSpeed)
        );
        return;
      }

      act.log('Pause assertion passed: playSpeed=' + formatValue(pauseData.playSpeed));
      askUserToResume(videoObject);
    });
}

function askUserToResume(videoObject) {
  var resumeData = null;
  var lastObservedSpeed = undefined;

  function isResumeSpeed(speed) {
    return speed === 1 || speed === 1000;
  }

  function resolveResumeSpeed(callbackSpeed, currentPlaySpeed) {
    if (isResumeSpeed(currentPlaySpeed)) {
      return currentPlaySpeed;
    }

    if (isResumeSpeed(callbackSpeed)) {
      return callbackSpeed;
    }

    return null;
  }

  updateOnScreenStep(testMessages.resumeOnScreen);

  videoObject.onPlaySpeedChanged = function (speed) {
    lastObservedSpeed = speed;
    act.log('PlaySpeed Change detected: ' + formatValue(speed));
    logVideoObjectState(videoObject);

    var resolvedSpeed = resolveResumeSpeed(speed, videoObject.playSpeed);

    if (resolvedSpeed !== null && resumeData === null) {
      resumeData = capturePlaybackState(videoObject);
      resumeData.playSpeed = resolvedSpeed;
      resumeData.callbackSpeed = speed;
    }
  };

  act
    .ask(testMessages.resumePrompt)
    .addButton('Continue', true, 'primary')
    .send(function () {
      videoObject.onPlaySpeedChanged = null;

      if (!resumeData) {
        act.fail(
          'No resume play speed change event was detected. ' +
            'Expected callback speed 1/1000 or playSpeed=1, but last observed callback speed was ' +
            formatValue(lastObservedSpeed) +
            ' and current playSpeed is ' +
            formatValue(videoObject.playSpeed) +
            '.'
        );
        return;
      }

      var failures = [];

      if (!isResumeSpeed(resumeData.playSpeed)) {
        failures.push(
          'Expected playSpeed to be 1 or 1000 after resuming, but got ' +
            formatValue(resumeData.playSpeed)
        );
      }

      if (!(resumeData.playbackOffset > 0)) {
        failures.push(
          'Expected playbackOffset to be greater than 0 after resuming from a time-shifted position, ' +
            'but got ' +
            formatValue(resumeData.playbackOffset)
        );
      }

      act.log('Resume assertion: playSpeed=' + formatValue(resumeData.playSpeed));
      act.log('Resume assertion: playbackOffset=' + formatValue(resumeData.playbackOffset));
      act.log('Resume assertion: callback speed=' + formatValue(resumeData.callbackSpeed));

      failures.length ? act.fail(failures.join('\n')) : act.success();
    });
}

function runTest() {
  act.start();
  act.log('Test URL: ' + window.location.href);

  act.render(createInstructionScreen(), function () {
    try {
      waitForBroadcast(
        function (videoObject) {
          act.log('Broadcast video object is ready');
          askUserToPause(videoObject);
        },
        function () {
          act.fail(
            'Broadcast video object with an active currentChannel was not available within ' +
              testConfiguration.readinessTimeoutMs +
              'ms.'
          );
        }
      );
    } catch (e) {
      act.error(e);
    }
  });
}

loadSDK(runTest);
