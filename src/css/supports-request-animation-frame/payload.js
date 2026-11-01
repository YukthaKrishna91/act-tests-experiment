function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var rafId;
var count = 0;

function increment() {
  count += 1;
  rafId = window.requestAnimationFrame(increment);
}

function runTest() {
  act.start();

  try {
    window.requestAnimationFrame(function (highResTimeStamp) {
      if (typeof highResTimeStamp !== 'number') {
        act.fail('Request animation frame did not supply a DOMHighResTimeStamp');
      }
    });
  } catch (error) {
    act.fail('Request animation frame could not be called because: ' + error);
  }

  rafId = window.requestAnimationFrame(increment);
  setTimeout(function () {
    if (!(count > 20)) {
      act.fail('request animation frame did not call the callback');
    }
  }, 2000);

  setTimeout(function () {
    window.cancelAnimationFrame(rafId);
    var lastCount = count;
    setTimeout(function () {
      count !== lastCount
        ? act.fail('Request animation frame cannot be stopped using cancelAnimationframe')
        : act.success();
    }, 1000);
  }, 3000);
}

loadSDK(runTest);
