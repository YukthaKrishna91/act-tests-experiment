function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function runTest() {
  act.start();

  try {
    var userAgent = navigator.userAgent || '';
    var match = userAgent.match(/HbbTV\/(1\.[0-9]+\.[0-9]+)\b/);
    var hbbtvVersion = match && match[1] ? match[1] : null;

    act.log({
      userAgent: userAgent || 'User agent unavailable',
      matchedHbbtvVersion: hbbtvVersion
    });

    if (hbbtvVersion) {
      act.success();
      return;
    }

    act.fail('navigator.userAgent does not include a valid HbbTV/<version> token.');
  } catch (e) {
    act.error(e);
  }
}

loadSDK(runTest);
