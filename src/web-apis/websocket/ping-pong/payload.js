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

var baseUrl = 'wss://networking.certification.bbctvapps.co.uk/websocket';
var protocols = ['json'];

var askServerToPingClient = '{"action": "pingClient"}';
var echoMessage = '{"action": "echo", "message": "test message"}';

var secondsToWait = 1;
var hasPingPongOccured = false;

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
    if (webSocket.readyState !== OPEN_READY_STATE) {
      act.fail(
        'Failed to connect to WebSocket server.  Ready state ' +
          OPEN_READY_STATE +
          ' expected, ' +
          webSocket.readyState +
          ' received.'
      );
      return;
    }

    dispatchTelemetry(['Requesting server to ping client with message: ' + askServerToPingClient]);
    webSocket.send(askServerToPingClient);

    setTimeout(function () {
      dispatchTelemetry([
        'Waited ' + secondsToWait + ' second since requesting ping',
        'Checking if client has been ponged by requesting echo: ' + askServerToPingClient
      ]);
      webSocket.send(echoMessage);
    }, secondsToWait * 1000);
  };
  webSocket.onmessage = function (message) {
    dispatchTelemetry(['Received message: ' + message.data, 'Expected: ' + echoMessage]);

    if (message.data === echoMessage) {
      hasPingPongOccured = true;
      dispatchTelemetry(['Verified that ping pong exchange occured', 'Closing connection']);
    } else {
      act.fail('Received unexpected message');
    }
    webSocket.close();
  };
  webSocket.onclose = function () {
    if (hasPingPongOccured) {
      act.success();
    } else {
      act.fail('Could not verify that ping pong exchange occurred');
    }
  };
  webSocket.onerror = function (error) {
    dispatchTelemetry(['Websocket error: ' + error.message]);

    act.fail('Unexpected Websocket error occurred: ' + error.message);
  };
}

loadSDK(checkServerIsUp(runTest));
