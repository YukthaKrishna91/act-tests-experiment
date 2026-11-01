function loadSDK(callback) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

const configurationElementExpression = "document.getElementById('oipfcfg')";
const configurationExpression = configurationElementExpression + '.configuration';

var testMessages = {
  title: 'Support for System-Level Subtitles',
  screenInstructions:
    'Look at the test portal for instructions. Before continue, enable subtitles in the device system settings. Then continue in the portal prompt.',
  setupPrompt:
    'Before the test runs, please enable subtitles on the device using the system-level subtitle setting. Once subtitles are ON, press "Continue" to run the test.'
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

  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }

  if (value && typeof value.outerHTML === 'string') {
    return value.outerHTML;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return '{}';
  }
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
  var combinedInstructions = createElement(
    'p',
    screenStyles.paragraph,
    testMessages.screenInstructions
  );

  stage.appendChild(title);
  stage.appendChild(combinedInstructions);
  cell.appendChild(stage);
  container.appendChild(cell);

  return container;
}

function isConfigurationObject(element) {
  return (
    !!element &&
    typeof element.type === 'string' &&
    element.type.toLowerCase() === 'application/oipfconfiguration'
  );
}

function buildObservedValueMessage(expression, result) {
  var message = expression + ' -> ' + formatValue(result.value);

  if (result.error) {
    message += ' (read error)';
  }

  return message;
}

function createActHandle() {
  var failures = [];

  return {
    log: function (message) {
      act.log(message);
    },
    assert: function (assertion, message) {
      act.log((assertion ? 'PASS: ' : 'FAIL: ') + message);

      if (!assertion) {
        failures.push(message);
      }
    },
    complete: function () {
      if (failures.length > 0) {
        act.fail(JSON.stringify({ failures: failures }));
        return;
      }

      act.success();
    }
  };
}

function getConfigurationElement() {
  return readValue(function () {
    return document.getElementById('oipfcfg');
  });
}

function getConfiguration(elementResult) {
  return readValue(function () {
    return elementResult.value && elementResult.value.configuration;
  });
}

function assertConfigurationElement(actHandle, elementResult) {
  actHandle.assert(
    !elementResult.error && isConfigurationObject(elementResult.value),
    buildObservedValueMessage(configurationElementExpression, elementResult)
  );
}

function assertConfigurationObject(actHandle, configurationResult) {
  actHandle.assert(
    !configurationResult.error &&
      !!configurationResult.value &&
      typeof configurationResult.value === 'object',
    buildObservedValueMessage(configurationExpression, configurationResult)
  );
}

function runAssertions() {
  var actHandle = createActHandle();

  try {
    var configurationElementResult = getConfigurationElement();
    assertConfigurationElement(actHandle, configurationElementResult);

    var configurationResult = getConfiguration(configurationElementResult);
    assertConfigurationObject(actHandle, configurationResult);

    var subtitlesEnabledResult = readValue(function () {
      return configurationResult.value && configurationResult.value.subtitlesEnabled;
    });

    actHandle.assert(
      !subtitlesEnabledResult.error && subtitlesEnabledResult.value === true,
      buildObservedValueMessage(
        configurationExpression + '.subtitlesEnabled',
        subtitlesEnabledResult
      )
    );

    actHandle.complete();
  } catch (error) {
    act.error(error);
  }
}

function runTest() {
  act.start();

  act.render(createInstructionScreen(), function () {
    act
      .ask(testMessages.setupPrompt)
      .addButton('Continue', true, 'primary')
      .send(function () {
        runAssertions();
      });
  });
}

loadSDK(runTest);
