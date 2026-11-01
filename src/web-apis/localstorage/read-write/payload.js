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

function readWriteTest() {
  var key = 'key1';
  var value = 'value1';
  dispatchTelemetry('Adding item key: ' + key + ' value: ' + value);
  localStorage.setItem(key, value);
  dispatchTelemetry(
    'The contents of window.localStorage after item addition: ' +
      JSON.stringify(window.localStorage)
  );
  var storedValue = localStorage.getItem(key);
  dispatchTelemetry('Obtained value: ' + storedValue + ' for key: ' + key);
  return storedValue === value;
}

function runTest() {
  try {
    if (readWriteTest()) {
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
dispatchTelemetry(
  'The contents of window.localStorage at startup: ' + JSON.stringify(window.localStorage)
);
runTest();
