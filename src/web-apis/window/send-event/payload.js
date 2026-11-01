function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

let completed = false;

function runTest() {
  act.start();
  try {
    act.log('Starting Test');

    act.log('Adding event listener');
    window.addEventListener('message', (event) => {
      if (event.data.data.action === 'stop' && event.data.type === 'media-control') {
        act.success();
        completed = true;
      }
    });

    setTimeout(() => {
      if (!completed) {
        act.fail();
      }
    }, 1000);

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          version: 1,
          type: 'media-control',
          medium: 'referral',
          partner: 'com.test',
          origin: 'test',
          campaign: 'test',
          timestamp: '2020-02-11T15:52:00.000Z',
          data: {
            action: 'stop'
          }
        }
      })
    );
  } catch (e) {
    act.error(e);
  }
}

loadSDK(runTest);
