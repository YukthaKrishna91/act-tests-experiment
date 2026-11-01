var defaultKey = 'local-storage-limit';

function loadSDK(callback) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.0.1/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function runTest() {
  act.start();
  try {
    fetch('/act/test/monorepo/latest/web-apis/localstorage/local-storage-limit/storage.txt').then(
      function (response) {
        response.text().then(function (text) {
          localStorage.removeItem(defaultKey);
          localStorage.setItem(defaultKey, text);

          if (localStorage.getItem(defaultKey) === text) {
            localStorage.removeItem(defaultKey);
            act.success();
          } else {
            act.fail();
          }
        });
      }
    );
  } catch (e) {
    console.error(e);
    act.error(e);
  }
}

loadSDK(runTest);
