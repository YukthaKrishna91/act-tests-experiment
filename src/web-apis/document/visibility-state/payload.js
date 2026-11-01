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
    act.log('Starting Test');
    act.log('Requesting Manual Intervention...');

    const events = [];
    events.push(document.visibilityState);

    document.addEventListener('visibilitychange', (event) => {
      console.log(event);
      events.push(document.visibilityState);
    });

    act
      .ask('Go into another application and then return to iPlayer and select DONE')
      .addButton('DONE', true, 'primary')
      .send(function (response) {
        act.log('User Responded with: ' + response);
        events[0] === 'visible' && events[1] === 'hidden' && events[2] === 'visible'
          ? act.success()
          : act.fail();
      });
  } catch (e) {
    act.error(e);
  }
}

loadSDK(runTest);
