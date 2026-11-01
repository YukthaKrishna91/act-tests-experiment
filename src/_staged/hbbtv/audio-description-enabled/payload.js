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
    const oipFactory = window.oipfObjectFactory;

    if (oipFactory && oipFactory.createConfigurationObject) {
      act.log('oipfObjectFactory present');
      const createdConfig = oipFactory.createConfigurationObject();
      if (createdConfig && createdConfig.configuration) {
        act.log('created configuration object');
        const configuration = createdConfig.configuration;
        if (configuration.audioDescriptionEnabled !== undefined) {
          act.success();
        }
      }
    }
    act.fail();
  } catch (e) {
    act.error(e);
  }
}

loadSDK(runTest);
