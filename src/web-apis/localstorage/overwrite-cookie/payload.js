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

function overwriteCookieTest() {
  var initialCookie = 'overwriteCookieTest=initialValue';
  dispatchTelemetry('Adding cookie: ' + initialCookie);
  document.cookie = initialCookie;
  dispatchTelemetry('The contents of document.cookie after adding: ' + document.cookie);
  var overwrittenCookie = 'overwriteCookieTest=updatedValue';
  dispatchTelemetry('Overwriting cookie: ' + overwrittenCookie);
  document.cookie = overwrittenCookie;
  dispatchTelemetry('The contents of document.cookie after overwriting: ' + document.cookie);
  return (
    document.cookie.indexOf(initialCookie) === -1 &&
    document.cookie.indexOf(overwrittenCookie) !== -1
  );
}

function runTest() {
  try {
    if (overwriteCookieTest()) {
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
dispatchTelemetry('The contents of document.cookie at startup: ' + document.cookie);
runTest();
