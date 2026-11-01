function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var certificateEndpoint = 'securegate.iplayer.bbc.co.uk';

var maximumAcceptableTimeoutInMs = 10000;

function generateCallback(hostName) {
  var callbackName = '_callback_' + hostName.replace(/\./g, '_');
  var timer = window.setTimeout(function () {
    act.fail(['Request timed out after', maximumAcceptableTimeoutInMs, 'ms']);
  }, maximumAcceptableTimeoutInMs);

  window[callbackName] = function () {
    window.clearTimeout(timer);
    act.success();
  };
  return callbackName;
}

function testCertificateEndpoint(host) {
  var callbackName = generateCallback(host);
  var url = [
    'https://',
    host,
    '/mediaselector/6/select/version/2.0/vpid/fakeid01/format/json/mediaset/iptv-all/jsfunc/',
    callbackName,
    '/proto/http'
  ].join('');
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  document.body.appendChild(script);
}

function runTest() {
  act.start();

  try {
    testCertificateEndpoint(certificateEndpoint);
  } catch (e) {
    act.error(e);
  }
}

loadSDK(runTest);
