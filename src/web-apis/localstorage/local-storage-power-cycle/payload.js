var started = new Event('started');
var success = new Event('finished:success');
var failure = new Event('finished:failure');

var defaultKey = 'local-storage-power-cycle-test';
var defaultValue = '{name: actTest, testName:localStorage}';
var countDownDuration = 35;

function loadSDK(callback) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.0.1/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

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
  console.log('dispatch event');
  document.dispatchEvent(interventionRequest);
}

function runInterventionLogic() {
  dispatchTelemetry('Intervention logic is being run');
  var request = {
    type: 'manual-intervention',
    request: {
      text: '<b>Is this the first time you are seeing this?</b> <br/> <ol><li>Turn off the device</li> <li>Click on "Device is turned off" button</li><li>Please wait 3 minutes before turning device back on</li><li> Re-pair device.</li></ol><br/><br/><b>Otherwise</b> Click on "Dismiss" button',
      options: [
        {
          label: 'Device is turned off',
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
        dispatchTelemetry('Local storage did not work as intended');
        document.dispatchEvent(failure);
        return;
      } else {
        dispatchTelemetry('Waiting for the TV to be switched off');
      }
    } catch (err) {
      dispatchError(err.message);
    }
  }

  requestIntervention(request, handleInterventionResponse);
}

function runTest() {
  try {
    if (getItemFromLocalStorage(defaultKey) === defaultValue) {
      localStorage.removeItem(defaultKey);
      document.dispatchEvent(success);
      return;
    }

    writeToLocalStorage(defaultKey, defaultValue);
    displayCountDown(
      countDownDuration,
      'Turn off the device now and check ACT portal',
      runInterventionLogic
    );
  } catch (e) {
    console.error(e);
    dispatchError(e.message);
  }
}

function writeToLocalStorage(key, value) {
  localStorage.removeItem(key);
  localStorage.setItem(key, value);
}

function getItemFromLocalStorage(key) {
  return localStorage.getItem(key);
}

function createMessage(message) {
  var h1 = document.createElement('h1');
  h1.innerText = message;
  act.render(h1);
}

function displayCountDown(timeleft, message, callback) {
  var downloadTimer = setInterval(function () {
    if (timeleft <= 0) {
      clearInterval(downloadTimer);
      createMessage(message);
      if (callback) {
        callback();
      }
    } else {
      createMessage('Please wait ' + timeleft + ' seconds');
      timeleft -= 1;
    }
  }, 1000);
}
document.dispatchEvent(started);
loadSDK(runTest);
