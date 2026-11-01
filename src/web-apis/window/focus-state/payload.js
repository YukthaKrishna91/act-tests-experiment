function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

const getEventPhase = (phase) => {
  const phases = {
    1: 'CAPTURING_PHASE (1)',
    2: 'AT_TARGET (2)',
    3: 'BUBBLING_PHASE (3)'
  };
  return phases[phase] || 'Could not determine event phase';
};

function runTest() {
  act.start();
  try {
    act.log('Starting Test');
    act.log('Requesting Manual Intervention...');

    var didFocus = false;
    var didBlur = false;

    window.addEventListener('blur', (event) => {
      if (!document.hasFocus()) {
        act.log(`Blur event heard - non capture listener: ${getEventPhase(event.eventPhase)}`);
        didBlur = true;
      }
    });

    window.addEventListener(
      'blur',
      (event) => {
        if (!document.hasFocus()) {
          act.log(`Blur event heard - capture listener: ${getEventPhase(event.eventPhase)}`);
          didBlur = true;
        }
      },
      true
    );

    window.addEventListener('focus', (event) => {
      if (document.hasFocus()) {
        act.log(`focus event heard - non capture listener: ${getEventPhase(event.eventPhase)}`);
        didFocus = true;
      }
    });

    window.addEventListener(
      'focus',
      (event) => {
        if (document.hasFocus()) {
          act.log(`focus event heard - capture listener: ${getEventPhase(event.eventPhase)}`);
          didFocus = true;
        }
      },
      true
    );

    act
      .ask(
        'Go into passive mode by pressing home on the RC and then back into iPlayer and press DONE'
      )
      .addButton('DONE', true, 'primary')
      .send(function () {
        didFocus && didBlur ? act.success() : act.fail();
      });
  } catch (e) {
    act.error(e);
  }
}

loadSDK(runTest);
