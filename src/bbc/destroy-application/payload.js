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
    const applicationManager = window.bbc.oipfApplicationManager;
    const application = applicationManager.getOwnerApplication(window.document);
    if (application.destroyApplication && typeof application.destroyApplication === 'function') {
      act.success();
    } else {
      act.fail('desctoryApplication is not a function');
    }
  } catch (e) {
    act.fail(e);
  }
}

loadSDK(runTest);
