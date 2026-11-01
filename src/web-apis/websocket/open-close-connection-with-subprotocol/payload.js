function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var networkingServerVersionEndpoint = 'https://networking.certification.bbctvapps.co.uk/version';

function checkServerIsUp(runTest) {
  return () => {
    act.log(['Beginning networking server status check...']);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.timeout = 1000;
    xmlhttp.ontimeout = function () {
      act.error(['Server status check timed out. It is likely that the server is down.']);
    };
    xmlhttp.onerror = function (error) {
      act.error([
        'Server status check error. It is likely that the server is down.',
        error.message
      ]);
    };
    xmlhttp.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          act.log([
            'Networking server is up.',
            'Server information: ' + this.responseText,
            'Running test...'
          ]);
          runTest();
        } else {
          act.error([
            'Server status check received non 200 response: ' +
              this.status +
              '.  It is likely that the server is down.'
          ]);
        }
      }
    };
    xmlhttp.open('GET', networkingServerVersionEndpoint, true);
    xmlhttp.send();
  };
}

function dispatchTelemetry(detail) {
  act.log(detail);
}

var baseUrl = 'wss://networking.certification.bbctvapps.co.uk/websocket';
var subProtocol = 'json';

var OPEN_READY_STATE = 1;
var CLOSED_READY_STATE = 3;

function runTest() {
  act.start();

  if (typeof WebSocket !== 'function') {
    act.fail('WebSocket API is not supported by the browser');
    return;
  }
  if (typeof WebSocket.prototype.send !== 'function') {
    act.fail('WebSocket.prototype.send is not implemented by the browser');
    return;
  }
  if (typeof WebSocket.prototype.close !== 'function') {
    act.fail('WebSocket.prototype.close is not implemented by the browser');
    return;
  }

  var webSocket = new WebSocket(baseUrl, subProtocol);
  var errors = [];
  webSocket.onopen = function () {
    dispatchTelemetry([
      'Connected to ' + baseUrl,
      'Requested subprotocol: ' + subProtocol,
      'Established protocol: ' + webSocket.protocol,
      'Websocket ready state: ' + webSocket.readyState
    ]);
    if (webSocket.protocol !== subProtocol) {
      errors.push(
        'WebSocket not using expected protocol: ' +
          subProtocol +
          '. Actual protocol: ' +
          webSocket.protocol
      );
    }
    if (webSocket.readyState !== OPEN_READY_STATE) {
      errors.push(
        'WebSocket should be in open ready state: ' +
          OPEN_READY_STATE +
          '. Actual ready state: ' +
          webSocket.readyState
      );
    }
    if (errors.length > 0) {
      act.fail('Test failed: ' + errors.join(', '));
    }
    webSocket.close();
  };
  webSocket.onclose = function (closeEvent) {
    dispatchTelemetry(['Websocket closed']);
    if (webSocket.readyState !== CLOSED_READY_STATE) {
      errors.push(
        'Websocket did not close as expected. Expected ready state: ' +
          CLOSED_READY_STATE +
          '. Received: ' +
          webSocket.readyState
      );
    }
    if (!closeEvent.wasClean) {
      errors.push('Websocket did not close cleanly');
    }
    if (errors.length > 0) {
      act.fail('Test failed: ' + errors.join(', '));
    } else {
      act.success();
    }
  };
  webSocket.onerror = function (error) {
    dispatchTelemetry(['Websocket error: ' + error.message]);

    act.fail('Unexpected Websocket error occurred: ' + error.message);
  };
}

loadSDK(checkServerIsUp(runTest));
