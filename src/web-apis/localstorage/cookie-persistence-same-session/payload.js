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

function runTest() {
  try {
    var cookie = 'unique-key-act-time-stamp-same-session=' + Date.now();
    document.cookie = cookie;
    dispatchTelemetry('A cookie was added with the following details: ' + cookie);
    dispatchTelemetry(
      'The contents of document.cookie after adding a cookie is: ' + document.cookie
    );
    var result = document.cookie.indexOf(cookie) !== -1;
    dispatchTelemetry(result ? 'Cookie was found' : 'Cookie was not found');
    document.cookie = cookie + ';expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.dispatchEvent(result ? success : failure);
  } catch (e) {
    dispatchError(e.message);
  }
}

document.dispatchEvent(started);
dispatchTelemetry('Test starting at window location: ' + window.location.href);
dispatchTelemetry('The contents of document.cookie at startup: ' + document.cookie);
runTest();
