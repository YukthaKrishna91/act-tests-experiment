function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var endpoint = 'https://globalsign-root-r5.ca.networking.certification.bbctvapps.co.uk';
var versionEndpoint = 'https://amazon-root.ca.networking.certification.bbctvapps.co.uk';

function getBackendVersion(endpoint) {
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      act.fail({ status: xhr.status, responseText: xhr.responseText });
    }
  };

  xhr.ontimeout = function () {
    act.error('xhr to backend version endpoint timed out');
  };

  xhr.onerror = function () {
    act.error('xhr to backend version endpoint errored');
  };

  xhr.open('GET', endpoint, true);
  xhr.send();
}

function dispatchFailureWithBackendVersion(endpoint) {
  var inFlight = false;

  return function () {
    if (inFlight === false) {
      inFlight = true;
      getBackendVersion(endpoint);
    }
  };
}

function runTest() {
  act.start();

  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      act.success();
    }
  };

  xhr.onerror = dispatchFailureWithBackendVersion(versionEndpoint);
  xhr.ontimeout = dispatchFailureWithBackendVersion(versionEndpoint);

  xhr.timeout = 5000;
  xhr.open('GET', endpoint, true);
  xhr.send();
}

loadSDK(runTest);
