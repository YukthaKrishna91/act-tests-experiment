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

function expireCookieTest() {
  var testCookie = 'expireCookieTest=value';
  var testCookieExpiry = '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = testCookie + testCookieExpiry;
  dispatchTelemetry(
    'A cookie was added with the following details: ' + testCookie + testCookieExpiry
  );
  dispatchTelemetry(
    'The contents of document.cookie after a cookie has been added is: ' + document.cookie
  );
  return document.cookie.indexOf(testCookie) === -1;
}

function runTest() {
  try {
    if (expireCookieTest()) {
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
