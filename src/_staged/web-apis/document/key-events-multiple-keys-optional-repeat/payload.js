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

  var keyState = {
    // array of key code when key goes down
    keyDownLog: [],
    // key is key code, and value is { down: boolean, hadRepeat: boolean }
    keys: {}
  };

  var timers = [];

  var stopKeyEventLogger = logKeyEvents();

  var teardown = () => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    stopKeyEventLogger();
    timers.forEach((timer) => clearTimeout(timer));
  };

  var fail = (reason) => {
    teardown();
    act.fail(reason);
  };

  var unexpectedEventHandler = (type) => {
    fail('Got unexpected key' + type + ' event');
  };
  var onEvent = unexpectedEventHandler;
  var onNextEvent = (condition, timeoutMessage) => {
    return new Promise((resolve) => {
      var timer = setTimeout(() => {
        onEvent = unexpectedEventHandler;
        fail(timeoutMessage);
      }, 5000);
      timers.push(timer);

      onEvent = () => {
        if (condition(keyState)) {
          clearTimeout(timer);
          onEvent = () => {};
          resolve(keyState);
        }
      };
    });
  };

  var onKey = (type, event) => {
    var code = event.keyCode;
    if (typeof code !== 'number') {
      fail('Key down `keyCode` property was not a number');
      return;
    }

    var keyIsDown = keyState.keyDownLog.indexOf(code) >= 0;

    if (type === 'down') {
      if (keyIsDown) {
        if (event.repeat !== undefined && !event.repeat) {
          fail('Got a key down event for code "' + code + '" that was missing `repeat: true`');
          return;
        }

        keyState = Object.assign({}, keyState, {
          keyDownLog: keyState.keyDownLog,
          keys: Object.assign({}, keyState.keys, {
            [code]: Object.assign({}, keyState.keys[code], {
              hadRepeat: true
            })
          })
        });
      } else {
        if (event.repeat !== undefined && event.repeat) {
          fail(
            'Got a key down event for "' + code + '" with `repeat: true` when not expecting one'
          );
          return;
        }

        keyState = Object.assign({}, keyState, {
          keyDownLog: keyState.keyDownLog.concat(code),
          keys: Object.assign({}, keyState.keys, {
            [code]: { down: true, hadRepeat: false }
          })
        });
      }
    } else {
      if (!keyIsDown) {
        fail('Got a key up event for code "' + code + '" when not had a key down for it');
        return;
      }

      keyState = Object.assign({}, keyState, {
        keyDownLog: keyState.keyDownLog,
        keys: Object.assign({}, keyState.keys, {
          [code]: Object.assign({}, keyState.keys[code], {
            down: false
          })
        })
      });
    }

    onEvent(type);
  };

  var onKeyDown = (event) => {
    onKey('down', event);
  };

  var onKeyUp = (event) => {
    onKey('up', event);
  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  var pathWhereDevicePretendsNoKeyDown = async (state) => {
    $prompt.textContent = 'Please let go of the left key but keep holding the right key';

    // when the first key is released we should get a key down for the second key
    state = await onNextEvent(
      (newState) => newState.keyDownLog.length >= 2,
      'Timed out waiting for a keydown event for the second key'
    );

    $prompt.textContent = 'Please let go of the right key';
    state = await onNextEvent((newState) => !newState.keys[newState.keyDownLog[1]].down);
    if (state.keyDownLog.length > 2) {
      fail('Received more than 2 keydown events');
      return;
    }

    teardown();
    act.success();
  };

  var pathWhereDeviceAlwaysHasAtLeastOneKeyDown = async (state) => {
    $prompt.textContent = 'Please keep holding down both keys';
    state = await onNextEvent(
      (newState) => newState.keys[state.keyDownLog[1]].hadRepeat,
      'Timed out waiting for a keydown event with `repeat: true` for the second key'
    );
    if (state.keyDownLog.length > 2) {
      fail('Received more than 2 keydown events');
      return;
    }

    $prompt.textContent = 'Please let go of both keys';
    state = await onNextEvent((newState) =>
      newState.keyDownLog.every((newKey) => !newState.keys[newKey].down)
    );
    if (state.keyDownLog.length > 2) {
      fail('Received more than 2 keydown events');
      return;
    }

    teardown();
    act.success();
  };

  act.render($prompt, async () => {
    $prompt.textContent = 'Please hold down the left key';
    await onNextEvent(() => true, 'Timed out waiting for an event');

    $prompt.textContent = 'Please keep holding down the left key';

    var state = await onNextEvent(() => true, 'Timed out waiting for an event');
    // we should now still have one key and and it should have had a repeat
    if (state.keyDownLog.length !== 1) {
      fail('Received events for multiple keys when should only be one key down');
      return;
    }

    if (!state.keys[state.keyDownLog[0]].down) {
      fail(
        'We received a keyup event for key "' +
          state.keyDownLog[0] +
          '" when we were expecting a repeat key down event'
      );
      return;
    }

    if (!state.keys[state.keyDownLog[0]].hadRepeat) {
      fail(
        'We did not receive a keydown event with `repeat: true` for key "' +
          state.keyDownLog[0] +
          '"'
      );
      return;
    }

    $prompt.textContent =
      'Please keep holding down the left key and start holding down the right key';

    state = await onNextEvent(
      (newState) =>
        newState.keyDownLog.length >= 2 ||
        (newState.keyDownLog.length === 1 && !newState.keys[newState.keyDownLog[0]].down),
      'Timed out waiting for a keydown event'
    );
    if (state.keyDownLog.length > 2) {
      fail('Received more than 2 keydown events');
      return;
    }

    // note we don't require supporting multiple keys down at the same time in the spec
    // so it's ok if the first key is now up

    if (state.keyDownLog.length === 1 && !state.keys[state.keyDownLog[0]].down) {
      // this device might report no keys as down whilst multiple keys are down, which is ok
      await pathWhereDevicePretendsNoKeyDown(state);
    } else {
      await pathWhereDeviceAlwaysHasAtLeastOneKeyDown(state);
    }
  });
});
