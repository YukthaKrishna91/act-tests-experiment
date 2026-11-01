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

function runTest() {
  act.start();

  var apiUrl = 'https://networking.certification.bbctvapps.co.uk/cors/fake-origin';
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    dispatchTelemetry(['Ready state change', this.readyState]);
    if (this.readyState === 4) {
      dispatchTelemetry(['Response Recieved', this.status, this.responseText]);
      testResponse(this.status);
    }
  };
  xmlhttp.onerror = function (err) {
    dispatchTelemetry(['XHR Error', err, 'for', apiUrl]);
  };
  xmlhttp.open('GET', apiUrl, true);
  xmlhttp.send();
}

function testResponse(status) {
  if (status === 200) {
    act.fail('Received unexpected 200 response');
  } else if (status === 0) {
    act.success();
  } else {
    act.error(['Received unexpected status for this test: ', status]);
  }
}

loadSDK(runTest);
