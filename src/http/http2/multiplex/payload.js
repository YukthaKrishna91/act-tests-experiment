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
var multiplexResponseReceived = false;

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
  if (xhrItem.timeout) {
    xmlhttp.timeout = xhrItem.timeout;
  }

  xmlhttp.open('GET', xhrItem.url, true);
  xmlhttp.send();
  if (xhrItem.onSend) {
    xhrItem.onSend();
  }
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
    url: 'https://networking.certification.bbctvapps.co.uk:7854/multiplex-prep',
    onSend: function () {
      dispatchTelemetry(
        '/multiplex-prep request is send. Sending request to /multiplex using backend version: ' +
          backendVersion.toString()
      );
      xhrChainRunning = false;
      runXhrGetItem({
        url: 'https://networking.certification.bbctvapps.co.uk:7854/multiplex',
        onReady: function (event) {
          dispatchTelemetry('Received complete response from /multiplex');
          var multiplexJsonResponse = JSON.parse(event.responseText);
          if (multiplexJsonResponse.nofFrames > 1) {
            dispatchTelemetry(
              'Received complete response from /multiplex indicating more than one frame has been send'
            );
            multiplexResponseReceived = true;
          } else {
            act.fail(
              'Response has been received from /multiplex endpoint indicating number of frames <= 1 was send using backend version: ' +
                backendVersion.toString()
            );
          }
        },
        failedText: 'GET request to backendVersion endpoint failed.'
      });
    },
    onReady: function (event) {
      dispatchTelemetry('Received complete response from /multiplex-prep');
      var multiplexPrepJsonResponse = JSON.parse(event.responseText);
      if (multiplexPrepJsonResponse.nofFramesSend > 1) {
        dispatchTelemetry(
          'Received complete response from /multiplex-prep indicating more than one frame has been send'
        );
        if (multiplexResponseReceived) {
          act.success();
        } else {
          act.fail(
            'Response has been received from /multiplex-prep endpoint while the response for /multiprep has not yet been received using backend version: ' +
              backendVersion.toString()
          );
        }
      } else {
        act.fail(
          'Response has been received from /multiplex-prep endpoint indicating number of frames <= 1 was send using backend version: ' +
            backendVersion.toString()
        );
      }
    },
    timeout: 60000,
    failedText: 'GET request to http2 multiplex-prep endpoint failed.'
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
