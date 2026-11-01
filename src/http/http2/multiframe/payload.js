function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var backendVersion = 'UNKNOWN';
var xhrChainIndex = 0;
var xhrChainRunning = true;

function dispatchTelemetry(detail) {
  act.log(detail);
}

function runXhrGetItem(xhrItem) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        xhrChainIndex++;
        xhrItem.onReady(this);
        if (xhrChainRunning && xhrChainIndex < xhrChain.length) {
          runXhrGetItem(xhrChain[xhrChainIndex]);
        }
      } else {
        act.fail(xhrItem.failedText);
      }
    }
  };
  xmlhttp.onerror = function () {
    act.error(xhrItem.failedText);
  };
  xmlhttp.ontimeout = function () {
    act.error(xhrItem.failedText);
  };
  dispatchTelemetry('Sending GET to: ' + xhrItem.url);
  xmlhttp.timeout = 2000;
  xmlhttp.open('GET', xhrItem.url, true);
  xmlhttp.send();
}

var xhrChain = [
  {
    url: 'https://networking.certification.bbctvapps.co.uk/version',
    onReady: function (event) {
      backendVersion = JSON.parse(event.responseText).backend_version;
    },
    failedText: 'GET request to backendVersion endpoint failed.'
  },
  {
    url: 'https://networking.certification.bbctvapps.co.uk:7854/multiframe',
    onReady: function (event) {
      var jsonResponse = JSON.parse(event.responseText);
      if (jsonResponse.nofFrames > 1) {
        act.success();
      } else {
        act.fail(
          'Response has been received but it does not indicate number of frames > 1 with backendVersion: ' +
            backendVersion.toString()
        );
      }
    },
    failedText: 'GET request to http2 multiframe endpoint failed.'
  }
];

function runXhrGetChain() {
  if (xhrChain.length > 0) {
    runXhrGetItem(xhrChain[0]);
  } else {
    act.fail('No request was performed. Failed');
  }
}

function runTest() {
  act.start();
  runXhrGetChain();
}

loadSDK(runTest);
