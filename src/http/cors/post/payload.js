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

  var apiUrl = 'https://networking.certification.bbctvapps.co.uk/cors/post';
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    dispatchTelemetry(['Ready state change', this.readyState]);
    if (this.readyState === 4) {
      dispatchTelemetry(['Response Received', this.status, this.responseText]);
      if (this.status === 200) {
        var response = this.responseText;
        testResponse(response);
      } else {
        act.error(['Non 200 response received: ', this.status]);
      }
    }
  };
  var body = JSON.stringify({ actableTest: 'Partner Experience' });
  xmlhttp.open('POST', apiUrl, true);
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.send(body);
}

function testResponse(actualResponse) {
  var expectedResponse = JSON.stringify({ actableTest: 'Partner Experience' });
  dispatchTelemetry(['Test response', actualResponse, 'compared to', expectedResponse]);
  if (actualResponse === expectedResponse) {
    act.success();
  } else {
    act.fail(['Test response ', actualResponse, ' differs from ', expectedResponse]);
  }
}

loadSDK(runTest);
