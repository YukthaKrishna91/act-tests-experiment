function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

const expectedRequirements = {
  liveCurrentChannelProperties: {
    sid: 37333,
    name: 'BBC ACT L',
    channelType: 0,
    idType: 41,
    onid: 9018,
    tsid: 37200,
    ipBroadcastID: [undefined, 'dvb://233a..91d5']
  },
  testCurrentChannelProperties: {
    sid: 37325,
    name: 'BBC ACT T',
    channelType: 0,
    idType: 41,
    onid: 9018,
    tsid: 37200,
    ipBroadcastID: [undefined, 'dvb://233a..91cd']
  }
};

function getExpectedCurrentChannelProperties() {
  return window.location.href.indexOf('.test.') !== -1
    ? expectedRequirements.testCurrentChannelProperties
    : expectedRequirements.liveCurrentChannelProperties;
}

const testConfiguration = {
  readinessTimeoutMs: 5000,
  readinessPollIntervalMs: 250
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

  if (Array.isArray(value)) {
    return '[' + value.map(formatValue).join(', ') + ']';
  }

  if (typeof value === 'object') {
    return '{}';
  }

  return String(value);
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

function getVideoObjectExpression() {
  var videoObject = getVideoObject();

  if (!videoObject) {
    return 'broadcast video object';
  }

  if (videoObject.id) {
    return "document.getElementById('" + videoObject.id + "')";
  }

  return "first <object type='video/broadcast'>";
}

function getCurrentChannel() {
  var videoObject = getVideoObject();

  return videoObject ? videoObject.currentChannel : undefined;
}

function getCurrentChannelValue(propertyName) {
  var currentChannel = getCurrentChannel();

  return currentChannel ? currentChannel[propertyName] : undefined;
}

function getObjectDiagnostics() {
  var objects = document.getElementsByTagName('object');
  var diagnostics = [];
  var index;

  for (index = 0; index < objects.length; index += 1) {
    diagnostics.push({
      id: objects[index].id || '',
      type: objects[index].type || '',
      hasCurrentChannelProperty: 'currentChannel' in objects[index],
      hasBindToCurrentChannel: typeof objects[index].bindToCurrentChannel === 'function'
    });
  }

  return diagnostics;
}

function valuesMatch(actualValue, expectedValue) {
  if (Array.isArray(expectedValue)) {
    return expectedValue.some(function (expectedOption) {
      return valuesMatch(actualValue, expectedOption);
    });
  }

  if (typeof expectedValue === 'undefined') {
    return typeof actualValue === 'undefined';
  }

  return actualValue === expectedValue;
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

function getFailureMessage(expression, actualValue, expectedValue) {
  return (
    expression + ' expected ' + formatValue(expectedValue) + ' but got ' + formatValue(actualValue)
  );
}

function logAssertionValue(expression, actualValue, expectedValue, hasError) {
  var message =
    expression + ' expected ' + formatValue(expectedValue) + ', actual ' + formatValue(actualValue);

  if (hasError) {
    message += ' (read error)';
  }

  act.log(message);
}

function failWithDiagnostics(currentChannelResult) {
  var videoObject = getVideoObject();
  var failureDetails = [];
  var videoObjectExpression = getVideoObjectExpression();

  if (!videoObject) {
    failureDetails.push('No broadcast video object was found.');
  } else {
    failureDetails.push(
      videoObjectExpression + '.type is ' + formatValue(videoObject.type || undefined)
    );
    failureDetails.push(
      videoObjectExpression +
        ' has currentChannel property: ' +
        formatValue('currentChannel' in videoObject)
    );
    failureDetails.push(
      videoObjectExpression +
        ' has bindToCurrentChannel: ' +
        formatValue(typeof videoObject.bindToCurrentChannel === 'function')
    );
  }

  if (currentChannelResult && currentChannelResult.error) {
    failureDetails.push('Reading currentChannel threw: ' + formatValue(currentChannelResult.value));
  } else {
    failureDetails.push(
      'currentChannel after waiting is ' +
        formatValue(currentChannelResult ? currentChannelResult.value : undefined)
    );
  }

  failureDetails.push('Available object elements: ' + JSON.stringify(getObjectDiagnostics()));

  act.log({
    videoObjectExpression: videoObjectExpression,
    videoObjectFound: !!videoObject,
    videoObjectType: videoObject ? videoObject.type || '' : '',
    currentChannelValue: currentChannelResult ? currentChannelResult.value : undefined,
    currentChannelError: currentChannelResult ? currentChannelResult.error : null,
    objects: getObjectDiagnostics()
  });

  act.fail(failureDetails.join('\n'));
}

function runAssertions() {
  var failures = [];
  var expectedCurrentChannelProperties = getExpectedCurrentChannelProperties();
  var propertyNames = Object.keys(expectedCurrentChannelProperties);
  var videoObjectExpression = getVideoObjectExpression();
  var index;

  for (index = 0; index < propertyNames.length; index += 1) {
    var propertyName = propertyNames[index];
    var expectedValue = expectedCurrentChannelProperties[propertyName];
    var propertyResult = readValue(function () {
      return getCurrentChannelValue(propertyName);
    });

    logAssertionValue(
      videoObjectExpression + '.currentChannel.' + propertyName,
      propertyResult.value,
      expectedValue,
      propertyResult.error
    );

    if (propertyResult.error || !valuesMatch(propertyResult.value, expectedValue)) {
      failures.push(
        getFailureMessage(
          videoObjectExpression + '.currentChannel.' + propertyName,
          propertyResult.value,
          expectedValue
        )
      );
    }
  }

  return failures;
}

function runTest() {
  act.start();
  act.log('Test URL: ' + window.location.href);

  try {
    var deadline = Date.now() + testConfiguration.readinessTimeoutMs;

    function evaluate() {
      var currentChannelResult = readValue(getCurrentChannel);

      if (!currentChannelResult.error && currentChannelResult.value) {
        var failures = runAssertions();
        failures.length ? act.fail(failures.join('\n')) : act.success();
        return;
      }

      if (Date.now() < deadline) {
        setTimeout(evaluate, testConfiguration.readinessPollIntervalMs);
        return;
      }

      failWithDiagnostics(currentChannelResult);
    }

    evaluate();
  } catch (e) {
    act.error(e);
  }
}

loadSDK(runTest);
