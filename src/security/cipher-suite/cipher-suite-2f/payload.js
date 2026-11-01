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

var cipherSuite2f = 'AES128-SHA';

function runTest() {
  act.start();

  var apiUrl =
    'https://networking.certification.bbctvapps.co.uk:9002/tls/1.2/echo_supported_client_ciphers';
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.timeout = 5000;
  xmlhttp.ontimeout = function () {
    act.error(['XHR Request Timed Out']);
  };
  xmlhttp.onerror = function () {
    act.error(['XHR Request Errored']);
  };
  xmlhttp.onreadystatechange = function () {
    dispatchTelemetry(['Ready state change', this.readyState]);
    if (this.readyState === 4) {
      dispatchTelemetry(['Response Received', this.status, this.responseText]);
      if (this.status === 200) {
        var response = JSON.parse(this.responseText);
        testResponse(response);
      } else {
        act.error(['Non 200 response received: ', this.status]);
      }
    }
  };
  xmlhttp.open('GET', apiUrl, true);
  xmlhttp.send();
}

function testResponse(actualResponse) {
  var suites = actualResponse.client_supported_ciphers;
  dispatchTelemetry(['Supported Suites: ', suites]);
  if (suites.indexOf(cipherSuite2f) !== -1) {
    act.success();
  } else {
    act.fail('Expected cipher suite: ' + cipherSuite2f + ' not supported');
  }
}

loadSDK(runTest);
