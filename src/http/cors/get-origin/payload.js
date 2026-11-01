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

  var apiUrl = 'https://networking.certification.bbctvapps.co.uk/cors/default-origin';
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    dispatchTelemetry(['Ready state change', this.readyState]);
    if (this.readyState === 4) {
      dispatchTelemetry(['Response Recieved', this.status, this.responseText]);
      if (this.status === 200) {
        var response = this.responseText;
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
  var expectedResponse = [
    'Your Origin header: ',
    document.location.protocol,
    '//',
    document.location.host
  ].join('');
  dispatchTelemetry(['Test response', actualResponse, 'compared to', expectedResponse]);
  if (actualResponse === expectedResponse) {
    act.success();
  } else {
    act.fail([
      'Test response',
      actualResponse,
      ' differs from expected response ',
      expectedResponse
    ]);
  }
}

loadSDK(runTest);
