function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var requiredTls13CipherSupport = [
  'TLS_AES_256_GCM_SHA384',
  'TLS_CHACHA20_POLY1305_SHA256',
  'TLS_AES_128_GCM_SHA256'
];
var backendVersion = 'UNKNOWN';
var xhrChainIndex = 0;
var xhrChainRunning = true;
var failMessage = '';

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

function validateCiphers(cipherSupportResults) {
  dispatchTelemetry('Ciphers supported by client: ' + cipherSupportResults);
  var res = requiredTls13CipherSupport.length > 0;
  for (var cipherIndex = 0; cipherIndex < requiredTls13CipherSupport.length; cipherIndex++) {
    var cipherSupport =
      cipherSupportResults.indexOf(requiredTls13CipherSupport[cipherIndex]) !== -1;

    var cipherValidationMsg =
      'cipher: ' +
      requiredTls13CipherSupport[cipherIndex] +
      ' support: ' +
      cipherSupport.toString();
    if (!cipherSupport) {
      failMessage = failMessage + cipherValidationMsg + '; ';
    }
    dispatchTelemetry(cipherValidationMsg);
    res = res && cipherSupport;
  }
  return res;
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
    url: 'https://networking.certification.bbctvapps.co.uk:7850/tls/1.3/echo_supported_client_ciphers',
    onReady: function (event) {
      var jsonResponse = JSON.parse(event.responseText);
      if (
        jsonResponse.client_supported_ciphers &&
        validateCiphers(jsonResponse.client_supported_ciphers)
      ) {
        act.success();
      } else {
        act.fail(
          'TLS v1.3 cipher support test failed because not all required ciphers are supported with backendVersion: ' +
            backendVersion.toString() +
            '. Missing ciphers: ' +
            failMessage
        );
      }
    },
    failedText:
      'GET request to TLS endpoint failed indicating no TLS v1.3 cipher support with backendVersion: ' +
      backendVersion.toString()
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
