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

function writeDeleteTest() {
  var key = 'key';
  var value = 'value';
  dispatchTelemetry(
    'The following key: ' + key + ' value: ' + value + ' pair will be written to local storage'
  );
  localStorage.setItem(key, value);
  dispatchTelemetry('The item has been written');
  dispatchTelemetry(
    'The contents of window.localStorage after writing is: ' + JSON.stringify(window.localStorage)
  );
  localStorage.removeItem(key);
  dispatchTelemetry('The item has now been deleted');
  dispatchTelemetry(
    'The contents of window.localStorage after deletion is: ' + JSON.stringify(window.localStorage)
  );
  var storedValue = localStorage.getItem(key);
  return storedValue === null;
}

function runTest() {
  try {
    if (writeDeleteTest()) {
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
