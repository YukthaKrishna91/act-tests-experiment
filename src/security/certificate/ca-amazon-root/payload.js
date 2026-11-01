function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var endpoint = 'https://amazon-root.ca.networking.certification.bbctvapps.co.uk';

function runTest() {
  act.start();

  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      act.log({ status: xhr.status, response: xhr.responseText });
      act.success();
    }
  };

  xhr.ontimeout = function () {
    act.error('request to amazon root CA endpoint timed out');
  };

  xhr.onerror = function () {
    act.error('request to amazon root CA endpoint errored');
  };

  act.log('setting timeout for request to amazon root CA endpoint to 5s');
  xhr.timeout = 5000;
  xhr.open('GET', endpoint, true);
  xhr.send();
}

loadSDK(runTest);
