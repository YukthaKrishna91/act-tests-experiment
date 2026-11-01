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

var OPEN_READY_STATE = 1;
var WEBSOCKET_CLOSED_ABNORMALLY_CODE = 1006;

var baseUrl = 'wss://networking.certification.bbctvapps.co.uk/websocket';
var protocols = ['json'];
var hasConnected = false;

var messageToAbruptlyLoseConnection = JSON.stringify({
  action: 'loseConnection'
});

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

  var webSocket = new WebSocket(baseUrl, protocols);
  webSocket.onopen = function () {
    dispatchTelemetry([
      'Connected to ' + baseUrl,
      'Requested subprotocols: ' + protocols.join(', '),
      'Established protocol: ' + webSocket.protocol,
      'Websocket ready state: ' + webSocket.readyState
    ]);
    if (webSocket.readyState === OPEN_READY_STATE) {
      hasConnected = true;
    } else {
      act.fail(
        'Failed to connect to WebSocket server.  Ready state ' +
          OPEN_READY_STATE +
          ' expected, ' +
          webSocket.readyState +
          ' received.'
      );
      return;
    }

    webSocket.send(messageToAbruptlyLoseConnection);
  };
  webSocket.onmessage = function (message) {
    dispatchTelemetry(['Received message: ' + message.data]);

    act.fail(
      'Connection should have been closed by client but received unexpected message instead'
    );
  };
  webSocket.onerror = function (error) {
    dispatchTelemetry(['Websocket error: ' + error.message]);

    act.fail('Unexpected Websocket error occurred: ' + error.message);
  };
  webSocket.onclose = function (closeEvent) {
    if (!hasConnected) {
      act.fail('Failed to establish WebSocket connection');
      return;
    }

    dispatchTelemetry([
      'Connection closed',
      'Code: ' + closeEvent.code + ' (Excepted ' + WEBSOCKET_CLOSED_ABNORMALLY_CODE + ')'
    ]);
    if (closeEvent.code === WEBSOCKET_CLOSED_ABNORMALLY_CODE) {
      act.success();
    } else {
      act.fail(
        'Websocket connection did not close with expected code ' + WEBSOCKET_CLOSED_ABNORMALLY_CODE
      );
    }
  };
}

loadSDK(checkServerIsUp(runTest));
