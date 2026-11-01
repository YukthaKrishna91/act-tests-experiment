function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var endpoint = 'https://networking.certification.bbctvapps.co.uk/cache/no-cache';
var responses = [];

function dispatchTelemetry(detail) {
  act.log(detail);
}

function firstRequest() {
  var xhr = new XMLHttpRequest();
  dispatchTelemetry(['Ready state change', xhr.readyState]);
  xhr.onreadystatechange = function () {
    dispatchTelemetry(['Ready state change: ', xhr.readyState, xhr.status, xhr.responseText]);
    if (xhr.readyState === 4) {
      dispatchTelemetry(['Response Recieved', xhr.status, xhr.responseText]);
      if (xhr.status === 200) {
        var jsonFirstResponse = JSON.parse(xhr.responseText);
        responses[0] = jsonFirstResponse.message;
        secondRequest();
      } else {
        act.error(['Non 200 response received: ', this.status]);
      }
    }
  };
  xhr.open('GET', endpoint, true);
  xhr.send();
}

function secondRequest() {
  var xhr = new XMLHttpRequest();
  dispatchTelemetry(['Ready state change', xhr.readyState]);
  xhr.onreadystatechange = function () {
    dispatchTelemetry(['Ready state change: ', xhr.readyState, xhr.status, xhr.responseText]);
    if (xhr.readyState === 4) {
      dispatchTelemetry(['Response Received', xhr.status, xhr.responseText]);
      if (xhr.status === 200) {
        var jsonSecondResponse = JSON.parse(xhr.responseText);
        responses[1] = jsonSecondResponse.message;
        compareResponses();
      } else {
        act.error(['Unexpected non 200 response status received: ', xhr.status]);
      }
    }
  };
  xhr.open('GET', endpoint, true);
  xhr.send();
}

function compareResponses() {
  dispatchTelemetry(['Response 1 ', responses[0]]);
  dispatchTelemetry(['Response 2 ', responses[1]]);
  if (responses[0] !== responses[1]) {
    act.success();
  } else {
    act.fail('Responses despite no-cache are equal');
  }
}

function runTest() {
  act.start();
  firstRequest();
}

loadSDK(runTest);
