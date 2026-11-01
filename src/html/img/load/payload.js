function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var failed = false;
function failOnce(reason) {
  if (failed) return;
  failed = true;
  act.fail(reason);
}

function runTest() {
  act.start();

  var $img = document.createElement('img');
  $img.onload = function () {
    if (!$img.complete) {
      failOnce('The `complete` property was false in the `onload` callback.');
      return;
    }
    act.success();
  };

  $img.onerror = function () {
    failOnce('`onerror` callback was called');
  };

  if (!$img.complete) {
    failOnce('The `complete` property was false before a src had been set');
    return;
  }

  $img.src = '/act/test/monorepo/latest/html/img/load/test-card.jpg';
}

loadSDK(runTest);
