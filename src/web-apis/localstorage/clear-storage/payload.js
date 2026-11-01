var started = new Event('started');
var success = new Event('finished:success');
var failure = new Event('finished:failure');

function dispatchError(detail) {
  var error = new CustomEvent('finished:error', { detail: detail });
  document.dispatchEvent(error);
}

function dispatchTelemetry(detail) {
  var telemetry = new CustomEvent('telemetry', { detail: detail });
  document.dispatchEvent(telemetry);
}

function clearStorageTest() {
  var items = {
    a: 'one',
    b: 'two',
    c: 'three'
  };
  clearTimeout;
  dispatchTelemetry(
    'Before writing data the local storage content is: ' + JSON.stringify(window.localStorage)
  );

  Object.keys(items).forEach(function (key) {
    dispatchTelemetry(
      'Writing key: ' + key + ' with content: ' + items[key] + ' to local storage.'
    );
    window.localStorage.setItem(key, items[key]);
  });

  dispatchTelemetry(
    'After writing data the local storage content is: ' + JSON.stringify(window.localStorage)
  );
  dispatchTelemetry('Clearing local storage...');
  window.localStorage.clear();
  dispatchTelemetry(
    'After clearing the local storage content is: ' + JSON.stringify(window.localStorage)
  );
  var storedValues = Object.keys(items).filter(function (key) {
    dispatchTelemetry('Finding: ' + key);
    return window.localStorage.getItem(key);
  });
  dispatchTelemetry('Found ' + storedValues.length + ' stored.');
  return storedValues.length === 0;
}

function runTest() {
  try {
    if (clearStorageTest()) {
      document.dispatchEvent(success);
    } else {
      document.dispatchEvent(failure);
    }
  } catch (e) {
    dispatchError(e.message);
  }
}

document.dispatchEvent(started);
dispatchTelemetry('Test starting at window location: ' + window.location.href);
runTest();
