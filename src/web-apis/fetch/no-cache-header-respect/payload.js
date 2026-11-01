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
  fetch(endpoint)
    .then(function (response) {
      dispatchTelemetry(['Response Recieved', response.status]);
      return response.json();
    })
    .then(function (responseBody) {
      responses[0] = responseBody.message;
      return secondRequest();
    });
}

function secondRequest() {
  fetch(endpoint)
    .then(function (response) {
      dispatchTelemetry(['Response Recieved', response.status]);
      return response.json();
    })
    .then(function (responseBody) {
      responses[1] = responseBody.message;
      compareResponses();
    });
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

  if (typeof window.fetch === 'undefined' && typeof fetch === 'undefined') {
    act.fail(['Fetch is not defined']);
  }

  firstRequest();
}

loadSDK(runTest);
