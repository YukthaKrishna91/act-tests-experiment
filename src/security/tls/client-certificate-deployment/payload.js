function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

let failedDeployments = 'Failed to verify client certificate for :: ';

function dispatchTelemetry(detail) {
  act.log(detail);
}

function failWithReason(detail) {
  act.fail(detail);
}

function constructUrl(serverUrl, serverPort) {
  return (
    'https://pac.networking.certification.bbctvapps.co.uk/api/ms-deployed?serverUrl=' +
    serverUrl +
    '&serverPort=' +
    serverPort.toString()
  );
}

function executeUrl(serverUrl, url, requestFinished) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      dispatchTelemetry('Response has been received from ' + serverUrl);
      dispatchTelemetry('Response status: ' + this.status.toString());
      dispatchTelemetry('Parsing JSON response');
      var resp = JSON.parse(this.responseText);
      console.log(resp);
      if (resp.result) {
        dispatchTelemetry('Client certificate is accepted for: ' + serverUrl);
        requestFinished(0);
      } else {
        dispatchTelemetry('Client certificate is NOT accepted for: ' + serverUrl);
        requestFinished(1);
      }
    }
  };
  xmlhttp.onerror = function () {
    dispatchTelemetry('xhr request errored');
    requestFinished(2);
  };
  xmlhttp.ontimeout = function () {
    dispatchTelemetry('xhr request timed out');
    requestFinished(2);
  };
  dispatchTelemetry('Sending GET request to: ' + serverUrl);
  xmlhttp.timeout = 10000;
  xmlhttp.open('GET', url, true);
  xmlhttp.withCredentials = true;
  xmlhttp.send();
}

function recurseSequence(config, index, nofPassed, done) {
  executeUrl(
    config[index].serverUrl,
    constructUrl(config[index].serverUrl, config[index].serverPort),
    function (result) {
      if (result === 1) {
        dispatchTelemetry(
          'Failed to verify the client certificate for: ' +
            config[index].serverUrl +
            ':' +
            config[index].serverPort.toString()
        );
        failedDeployments =
          failedDeployments +
          config[index].serverUrl +
          ':' +
          config[index].serverPort.toString() +
          '; ';
      } else if (result === 0) {
        nofPassed++;
      } else if (result === 2) {
        act.error('xhr request failed. Erroring test.');
        return;
      }
      if (index < config.length - 1) {
        index++;
        dispatchTelemetry(
          'Done with GET request to: ' +
            config[index].serverUrl +
            '. Now processing: ' +
            index.toString()
        );
        recurseSequence(config, index, nofPassed, done);
      } else {
        dispatchTelemetry(
          'Done with all GET requests. Number of passed serverUrls: ' + nofPassed.toString()
        );
        done(nofPassed);
      }
    }
  );
}

function runTest() {
  act.start();

  var config = [
    { serverUrl: 'ipsecure.int.bbc.co.uk', serverPort: 443 },
    { serverUrl: 'ipsecure.test.bbc.co.uk', serverPort: 443 },
    { serverUrl: 'ipsecure.stage.bbc.co.uk', serverPort: 443 },
    { serverUrl: 'securegate.iplayer.bbc.co.uk', serverPort: 443 }
  ];
  recurseSequence(config, 0, 0, function (nofPassed) {
    if (nofPassed === config.length) {
      act.success();
    } else {
      dispatchTelemetry('Not all servers trust the client certificate');
      failWithReason(failedDeployments);
    }
  });
}

loadSDK(runTest);
