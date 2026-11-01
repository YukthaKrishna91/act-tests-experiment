function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function dispatchTelemetry(detail) {
  act.log(detail);
}

function failWithReason(detail) {
  act.fail(detail);
}

function executeUrl(url) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      dispatchTelemetry('Response has been received from BBC cerfiticate manager server.');
      dispatchTelemetry('Response status: ' + this.status.toString());
      var resp = JSON.parse(this.responseText);
      if (resp.result) {
        act.success();
      } else {
        dispatchTelemetry('Failure. Details: ' + resp.details);
        failWithReason(resp.details);
      }
    }
  };
  xmlhttp.onerror = function () {
    act.error('xhr request errored');
  };
  xmlhttp.ontimeout = function () {
    act.error('xhr request timed out');
  };
  dispatchTelemetry(
    'Sending GET request to authenticate endpoint of BBC certificate manager server.'
  );
  xmlhttp.timeout = 5000;
  xmlhttp.open('GET', url, true);
  xmlhttp.withCredentials = true;
  xmlhttp.send();
}

function runTest() {
  act.start();

  var url = 'https://pac.networking.certification.bbctvapps.co.uk/api/authenticate-client';
  executeUrl(url);
}

loadSDK(runTest);
