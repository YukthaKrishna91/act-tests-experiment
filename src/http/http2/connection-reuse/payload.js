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
var http2ConSocketId;

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
    url: 'https://networking.certification.bbctvapps.co.uk:7854/socket-reuse',
    onReady: function (event) {
      var jsonResponse = JSON.parse(event.responseText);
      dispatchTelemetry(
        'Received response from /socket-reuse endpoint with socketId: ' +
          jsonResponse.socketId +
          '. Saving the ID for the next req'
      );
      http2ConSocketId = jsonResponse.socketId;
    },
    failedText: 'GET request to HTTP2 /socket-reuse endpoint failed.'
  },
  {
    url: 'https://networking.certification.bbctvapps.co.uk:7854/socket-reuse',
    onReady: function (event) {
      var jsonResponse = JSON.parse(event.responseText);
      dispatchTelemetry(
        'Received response from /socket-reuse endpoint with socketId: ' +
          jsonResponse.socketId +
          '. Checking with the previous req'
      );
      if (http2ConSocketId === jsonResponse.socketId && jsonResponse.socketIdReused) {
        act.success();
      } else {
        act.fail(
          'HTTP2 Connection reuse failed. First request resulted in ID: ' +
            http2ConSocketId +
            '. Second req results in ID: ' +
            jsonResponse.socketId +
            '. Socket reuse: ' +
            jsonResponse.socketIdReused +
            '. Used backendVersion' +
            backendVersion.toString()
        );
      }
    },
    failedText: 'GET request to HTTP2 /socket-reuse endpoint failed.'
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
