function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function logKeyEvents() {
  var log = (type, event) => {
    act.log(
      '[Key' + type + 'Event] keyCode: "' + event.keyCode + '", repeat: "' + event.repeat + '"'
    );
  };

  var onKeyDown = (event) => log('Down', event);
  var onKeyUp = (event) => log('Up', event);

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  return () => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
  };
}

loadSDK(function () {
  act.start();
  var $prompt = document.createElement('div');

  act.render($prompt, async () => {
    var timers = [];

    var stopKeyEventLogger = logKeyEvents();

    var teardown = () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      stopKeyEventLogger();
      timers.forEach((timer) => clearTimeout(timer));
    };

    var sleep = (delay) =>
      new Promise((resolve) => timers.push(setTimeout(() => resolve(), delay)));

    var fail = (reason) => {
      teardown();
      act.fail(reason);
    };

    var onNextKeyCallback = {
      up: null,
      down: null
    };

    var onNextKey = (type, timeoutMessage) => {
      return new Promise((resolve) => {
        var timer = timeoutMessage
          ? setTimeout(() => {
              fail(timeoutMessage);
            }, 5000)
          : null;
        timer && timers.push(timer);

        clearNextKey(type);

        onNextKeyCallback[type] = {
          timeoutTimer: timer,
          callback: (event) => {
            clearTimeout(timer);
            resolve(event);
          }
        };
      });
    };

    var clearNextKey = (type) => {
      if (onNextKeyCallback[type]) {
        var timer = onNextKeyCallback[type].timeoutTimer;
        timer && clearTimeout(timer);
        onNextKeyCallback[type] = null;
      }
    };

    var clearNextKeyDown = () => clearNextKey('down');
    var onNextKeyDown = (timeoutMessage) => onNextKey('down', timeoutMessage);
    var onNextKeyUp = (timeoutMessage) => onNextKey('up', timeoutMessage);

    var onKey = (type, event) => {
      if (onNextKeyCallback[type]) {
        var callback = onNextKeyCallback[type].callback;
        onNextKeyCallback[type] = null;
        callback(event);
      } else {
        fail('Got a key ' + type + ' event unexpectedly');
      }
    };

    var onKeyDown = (event) => {
      onKey('down', event);
    };

    var onKeyUp = (event) => {
      onKey('up', event);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    $prompt.textContent = 'Please hold down a key';

    var event = await onNextKeyDown('Timed out waiting for key down event');
    var keyCode = event.keyCode;
    if (typeof keyCode !== 'number') {
      fail('Key down `keyCode` property was not a number');
      return;
    }

    $prompt.textContent = 'Please keep holding down the key';
    if (event.repeat !== undefined && event.repeat !== false) {
      fail('The `repeat` property in the first key down event was not `false`');
      return;
    }

    onNextKeyUp().then(() => {
      fail('Got a key up event when we were waiting for another key down event');
    });

    event = await onNextKeyDown('Timed out waiting for another key down event');
    if (event.keyCode !== keyCode) {
      fail('Key code changed in key down event');
      return;
    }

    if (event.repeat !== undefined && event.repeat !== true) {
      fail('The `repeat` property in the second key down event was not `true`');
      return;
    }

    var expectKeyDown = (event2) => {
      if (event2.keyCode !== keyCode) {
        fail('Key code changed in key down event');
        return;
      }
      if (event2.repeat !== undefined && event2.repeat !== true) {
        fail('The `repeat` property in a repeated key down event was not `true`');
        return;
      }
      return onNextKeyDown().then(expectKeyDown);
    };
    onNextKeyDown().then(expectKeyDown);

    await sleep(2000);

    $prompt.textContent = 'Please let go of the key';

    event = await onNextKeyUp('Timed out waiting for key up event');
    if (event.keyCode !== keyCode) {
      fail('Key code changed in key up event');
    }

    $prompt.textContent = 'Please wait';
    clearNextKeyDown();
    await sleep(2000);

    teardown();
    act.success();
  });
});
