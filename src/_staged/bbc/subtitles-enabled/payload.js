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
    const configurationObject = window.bbc.oipfConfiguration;
    if (configurationObject && configurationObject.configuration) {
      if (configurationObject.configuration.subtitlesEnabled !== undefined) {
        act.success();
      } else {
        act.fail('subtitlesEnabled does not exist on the configuration object');
      }
    } else {
      act.fail('the configuration object does not exist');
    }
  } catch (e) {
    act.fail(e);
  }
}

loadSDK(runTest);
