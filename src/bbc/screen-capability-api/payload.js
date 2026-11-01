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

  if (!window.getPrimaryDisplay) {
    act.fail('window.getPrimaryDisplay not available');
    return;
  }

  const { physicalWidth, physicalHeight, videoModes } = window.getPrimaryDisplay();

  if ((physicalWidth, physicalHeight, videoModes.length)) {
    act.success();
  } else {
    act.fail('Missing property from getPrimaryDisplay()');
  }
}

loadSDK(runTest);
