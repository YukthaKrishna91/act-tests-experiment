function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

const PASS = 'pass';
const FAIL = 'fail';

// https://www.oipf.tv/docs/OIPF-T1-R2_Specification-Volume-5-Declarative-Application-Environment-v2_3-2014-01-24.pdf
// section 7.2.5.1
const OIPF_KEYSET_RED = 0x1;
const OIPF_KEYSET_GREEN = 0x2;
const OIPF_KEYSET_YELLOW = 0x4;
const OIPF_KEYSET_BLUE = 0x8;
const OIPF_KEYSET_NAVIGATION = 0x10;
// This test needs the four colour keys plus Enter/OK and directional keys from NAVIGATION.
const HBBTV_REQUIRED_KEYSET_VALUE =
  OIPF_KEYSET_RED |
  OIPF_KEYSET_GREEN |
  OIPF_KEYSET_YELLOW |
  OIPF_KEYSET_BLUE |
  OIPF_KEYSET_NAVIGATION;

const REQUIRED_KEYS = [
  { name: 'VK_RED', label: 'RED' },
  { name: 'VK_GREEN', label: 'GREEN' },
  { name: 'VK_YELLOW', label: 'YELLOW' },
  { name: 'VK_BLUE', label: 'BLUE' },
  { name: 'VK_ENTER', label: 'ENTER/OK' },
  { name: 'VK_LEFT', label: 'LEFT' },
  { name: 'VK_UP', label: 'UP' },
  { name: 'VK_RIGHT', label: 'RIGHT' },
  { name: 'VK_DOWN', label: 'DOWN' }
];
const REMOTE_KEY_LABELS = {
  ColorF0Red: 'RED',
  ColorF1Green: 'GREEN',
  ColorF2Yellow: 'YELLOW',
  ColorF3Blue: 'BLUE',
  Enter: 'ENTER/OK',
  ArrowLeft: 'LEFT',
  ArrowUp: 'UP',
  ArrowRight: 'RIGHT',
  ArrowDown: 'DOWN'
};

const REMOTE_KEY_LABELS_BY_CODE = {
  403: 'RED',
  404: 'GREEN',
  405: 'YELLOW',
  406: 'BLUE',
  13: 'ENTER/OK',
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN'
};

const LABEL_COLORS = {
  RED: '#FF0000',
  GREEN: '#00AA00',
  YELLOW: '#FFFF00',
  BLUE: '#0000FF',
  'ENTER/OK': '#FFFFFF',
  UP: '#FFFFFF',
  DOWN: '#FFFFFF',
  LEFT: '#FFFFFF',
  RIGHT: '#FFFFFF'
};

function getPrompt(key) {
  const color = LABEL_COLORS[key.label] || '#000000';
  return `Press the <span style="color: ${color}; font-weight: bold;">${key.label}</span> key on the remote control.`;
}

function getPressedKeyLabel(event) {
  const labelFromKey = REMOTE_KEY_LABELS[event.key];
  if (labelFromKey) {
    return labelFromKey;
  }

  const labelFromCode = REMOTE_KEY_LABELS_BY_CODE[event.keyCode];
  if (labelFromCode) {
    return labelFromCode;
  }

  return event.key || `keyCode ${String(event.keyCode)}`;
}

function requestRemoteKeys() {
  try {
    const oipFactory = window.oipfObjectFactory;

    if (
      !oipFactory ||
      !oipFactory.isObjectSupported ||
      !oipFactory.isObjectSupported('application/oipfApplicationManager')
    ) {
      act.log('Application manager unavailable, unable to request HbbTV keyset.');
      return () => {};
    }

    const application = oipFactory
      .createApplicationManagerObject()
      .getOwnerApplication(window.document);

    if (
      !application ||
      !application.privateData ||
      !application.privateData.keyset ||
      typeof application.privateData.keyset.setValue !== 'function'
    ) {
      act.log('Application keyset API unavailable, continuing without explicit key registration.');
      return () => {};
    }

    const keyset = application.privateData.keyset;
    const previousKeysetValue =
      typeof keyset.value === 'number' && !Number.isNaN(keyset.value) ? keyset.value : null;

    keyset.setValue(HBBTV_REQUIRED_KEYSET_VALUE);
    act.log(`Requested HbbTV keyset value ${HBBTV_REQUIRED_KEYSET_VALUE}`);

    if (previousKeysetValue === null) {
      act.log('Previous HbbTV keyset value unavailable; skipping keyset restore.');
      return () => {};
    }

    let wasRestored = false;

    return () => {
      if (wasRestored) {
        return;
      }

      wasRestored = true;

      try {
        keyset.setValue(previousKeysetValue);
        act.log(`Restored HbbTV keyset value ${previousKeysetValue}`);
      } catch (error) {
        act.log(`Restoring HbbTV keyset failed: ${String(error)}`);
      }
    };
  } catch (error) {
    act.log(`Requesting HbbTV keyset failed: ${String(error)}`);
    return () => {};
  }
}

function focusPrompt(prompt) {
  prompt.tabIndex = -1;
  prompt.style.outline = 'none';
  prompt.focus();
}

function getRequiredKeys() {
  const keyEvent = window.KeyEvent;

  if (!keyEvent) {
    return {
      error: 'KeyEvent is not available on window.'
    };
  }

  const invalidKeys = [];
  const requiredKeys = REQUIRED_KEYS.map((key) => {
    const keyCode = keyEvent[key.name];
    act.log(`${key.name}: ${String(keyCode)}`);
    if (typeof keyCode !== 'number' || Number.isNaN(keyCode)) {
      invalidKeys.push(key.name);
    }

    return {
      ...key,
      keyCode
    };
  });

  if (invalidKeys.length > 0) {
    return {
      error: `Required VK constants are missing or non-numeric: ${invalidKeys.join(', ')}`
    };
  }

  return {
    requiredKeys
  };
}

function getCompletionMessage(failedKeys) {
  if (failedKeys.length > 0) {
    return 'Key capture complete. Select Finish Test to conclude and review the failed mappings in the logs.';
  }

  return 'Key capture complete. Select Finish Test to conclude this test before the next one starts.';
}

function finishTest(results) {
  const failedKeys = Object.keys(results).filter((keyName) => results[keyName] === FAIL);
  const passedKeys = Object.keys(results).filter((keyName) => results[keyName] === PASS);

  if (failedKeys.length > 0) {
    const keyError =
      'Some keys were incorrectly mapped. Please see the logs for a list of incorrect keys.';
    act.log(`Passed keys: ${passedKeys}`);
    act.log(`Wrong keys: ${failedKeys}`);
    act.fail(keyError);
    return;
  }

  act.success();
}

function runTest(requiredKeys, restoreRemoteKeys) {
  const $prompt = document.createElement('div');
  const $keyMessage = document.createElement('p');
  const $instructions = document.createElement('p');
  $instructions.textContent =
    'Press each requested key once. The test fails if the key press does not match the expected VK value.';

  $prompt.appendChild($keyMessage);
  $prompt.appendChild($instructions);

  act.render($prompt, () => {
    let idx = 0;
    const results = {};

    focusPrompt($prompt);
    $keyMessage.innerHTML = getPrompt(requiredKeys[idx]);
    window.addEventListener('keydown', onKeyDown, true);

    function onKeyDown(e) {
      e.stopPropagation();
      const currentKey = requiredKeys[idx];
      const keyName = currentKey.name;
      const pressedKeyLabel = getPressedKeyLabel(e);

      if (e.keyCode === currentKey.keyCode) {
        act.log(`Pressed ${pressedKeyLabel}: matched ${keyName} (${currentKey.keyCode})`);
        results[keyName] = PASS;
      } else {
        act.log(
          `Wrong key: expected ${currentKey.label} / ${keyName} (${currentKey.keyCode}), got ${pressedKeyLabel} (${String(e.keyCode)})`
        );
        results[keyName] = FAIL;
      }

      if (idx === requiredKeys.length - 1) {
        window.removeEventListener('keydown', onKeyDown, true);
        restoreRemoteKeys();
        const failedKeys = Object.keys(results).filter((keyName) => results[keyName] === FAIL);
        $keyMessage.textContent = 'All requested keys have been checked.';
        $instructions.textContent = getCompletionMessage(failedKeys);
        focusPrompt($prompt);
        act
          .ask('All requested keys have been checked. Select Finish Test to conclude this test.')
          .addButton('Finish Test', true, 'primary')
          .send(function () {
            finishTest(results);
          });
        return;
      }

      idx += 1;
      $keyMessage.innerHTML = getPrompt(requiredKeys[idx]);
    }
  });
}

loadSDK(function () {
  act.start();
  act.disableKeyHandling();
  const restoreRemoteKeys = requestRemoteKeys();

  const { requiredKeys, error } = getRequiredKeys();
  if (error) {
    restoreRemoteKeys();
    act.fail(error);
    return;
  }

  runTest(requiredKeys, restoreRemoteKeys);
});
