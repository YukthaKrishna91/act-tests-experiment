var started = new Event('started');
var success = new Event('finished:success');
var failure = new Event('finished:failure');

var defaultKey = 'unique-key-act-time-stamp-different-session';
var cookie = defaultKey + '=' + Date.now();
var expireCookieAddition = ';expires=Thu, 01 Jan 1970 00:00:01 GMT;';

function dispatchError(detail) {
  var error = new CustomEvent('finished:error', { detail: detail });
  document.dispatchEvent(error);
}

function dispatchTelemetry(detail) {
  var telemetry = new CustomEvent('telemetry', { detail: detail });
  document.dispatchEvent(telemetry);
}

function requestIntervention(element, callback) {
  document.addEventListener('responseToIntervention', function interventionResponse(ev) {
    document.removeEventListener('responseToIntervention', interventionResponse);
    callback(ev.detail);
  });
  var interventionRequest = new CustomEvent('requestIntervention', { detail: element });
  document.dispatchEvent(interventionRequest);
}

function runInterventionLogic() {
  dispatchTelemetry('Intervention logic is being run');
  var request = {
    type: 'manual-intervention',
    request: {
      text: 'If this is the second time you have seen this message for this test, then click the "Dismiss" button. Else, exit iPlayer and relaunch ACT on the device. Follow the steps at the top of the screen to re-pair your device.',
      options: [
        {
          label: 'Relaunched',
          value: null,
          class: 'primary'
        },
        {
          label: 'Dismiss',
          value: false,
          class: 'secondary'
        }
      ]
    }
  };

  function handleInterventionResponse(receivedResponse) {
    try {
      if (receivedResponse.response.userResponse === false) {
        dispatchTelemetry(
          'Cookie storage persistence in different session did not work as intended'
        );
        document.cookie = cookie + expireCookieAddition;
        document.dispatchEvent(failure);
      } else {
        dispatchTelemetry('Waiting for the TV to relaunch ACT');
      }
    } catch (err) {
      dispatchError(err.message);
    }
  }

  requestIntervention(request, handleInterventionResponse);
}

function getFutureDate() {
  var date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toUTCString();
}

function runTest() {
  try {
    if (document.cookie.indexOf(defaultKey) !== -1) {
      dispatchTelemetry('The key: ' + defaultKey + ' cookie has been found');
      document.cookie = cookie + expireCookieAddition;
      dispatchTelemetry(
        'The cookie has now been set to expire with the following declaration: ' +
          cookie +
          expireCookieAddition
      );
      document.dispatchEvent(success);
    } else {
      dispatchTelemetry('The key: ' + defaultKey + ' cookie was not discovered');
      var cookieToAdd = cookie + ';expires=' + getFutureDate();
      dispatchTelemetry('A cookie was added with the following details: ' + cookieToAdd);
      document.cookie = cookieToAdd;
      dispatchTelemetry(
        'The contents of document.cookie after adding a cookie is: ' + document.cookie
      );
      runInterventionLogic();
    }
  } catch (e) {
    dispatchError(e.message);
  }
}

document.dispatchEvent(started);
dispatchTelemetry('Test starting at window location: ' + window.location.href);
dispatchTelemetry('The contents of document.cookie at startup: ' + document.cookie);
runTest();
