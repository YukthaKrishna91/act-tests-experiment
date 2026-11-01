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

function getPrompt(key) {
  return `Press the ${key.toUpperCase()} key on the remote control.`;
}

function runTest(config) {
  const $prompt = document.createElement('div');
  const $keyMessage = document.createElement('p');
  const $skipMessage = document.createElement('p');
  $skipMessage.textContent =
    'If the requested key is not present, press the Enter/OK key to progress.';

  $prompt.appendChild($keyMessage);
  $prompt.appendChild($skipMessage);

  act.render($prompt, () => {
    const keys = Object.keys(config.input.map);
    let idx = 0;
    let currentKey = keys[idx];
    const results = {};

    $keyMessage.textContent = getPrompt(config.input.map[currentKey]);
    document.addEventListener('keydown', onKeyDown);

    function onKeyDown(e) {
      // Check key mapped correctly and store result
      const keyName = config.input.map[currentKey].toUpperCase();
      act.log('Testing ' + keyName);
      if (e.keyCode === parseInt(currentKey)) {
        act.log(`Correct! ${e.keyCode} matches ${currentKey}`);
        results[keyName] = PASS;
      } else {
        act.log(`Wrong key. ${e.keyCode} does not match currentKey`);
        results[keyName] = FAIL;
      }

      // Finish test if at end of keys
      if (idx === keys.length - 1) {
        $prompt.textContent = '';
        const failedKeys = Object.keys(results).filter((keyName) => results[keyName] === FAIL);
        const passedKeys = Object.keys(results).filter((keyName) => results[keyName] === PASS);
        if (failedKeys.length > 0) {
          const KeyError =
            'Some keys were incorrectly mapped. Please see the logs for a list of incorrect keys.';
          act.log(`Passed keys: ${passedKeys}`);
          act.log(`Wrong keys: ${failedKeys}`);
          act.fail(KeyError);
        } else {
          act.success();
        }
        document.removeEventListener('keydown', onKeyDown);
        return;
      }

      // Move index to next key
      idx = idx + 1;
      currentKey = keys[idx];
      $keyMessage.textContent = getPrompt(config.input.map[currentKey]);
    }
  });
}

loadSDK(function () {
  act.start();
  // prevent the back key closing the test
  act.disableKeyHandling();
  act.deviceConfig.getDeviceConfig((config) => {
    if (config === null) {
      act.fail('Config not found');
    } else {
      runTest(config);
    }
  });
});
