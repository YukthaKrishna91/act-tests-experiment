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

function processXhrEvent(event) {
  if (event.readyState === 4) {
    dispatchTelemetry('Response has been received from tsl v1.2: ' + event.responseText);
    if (event.status === 200) {
      act.success();
    } else {
      act.error(['Received non 200 response: ', event.status]);
    }
  }
}

function executeUrl(url) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    processXhrEvent(this);
  };
  xmlhttp.onerror = function () {
    act.error('XHR request errored');
  };
  xmlhttp.ontimeout = function () {
    act.error('Request timed out after: 2000ms');
  };
  dispatchTelemetry('Sending GET request to tls v1.2...');
  xmlhttp.timeout = 2000;
  xmlhttp.open('GET', url, true);
  xmlhttp.send();
}

function runTest() {
  act.start();

  var url = 'https://networking.certification.bbctvapps.co.uk:9002/tls/1.2/echo_tls_protocol/';
  executeUrl(url);
}

loadSDK(runTest);
