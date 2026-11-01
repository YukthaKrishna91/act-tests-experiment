'use strict';

function loadSDK(callback) {
  var script = document.createElement('script');
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
    fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-call-indirect-overlong/module.wasm')
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        if (!WebAssembly.validate(bytes)) {
          act.fail(
            'WebAssembly.validate rejected a module with an overlong call_indirect immediate'
          );
          return null;
        }
        return WebAssembly.instantiate(bytes, {});
      })
      .then(function (result) {
        if (result === null) {
          return;
        }
        if (!result || !result.instance) {
          act.fail('WebAssembly.instantiate did not produce an instance');
          return;
        }
        act.success();
      })
      .catch(function (e) {
        act.fail('Failed to compile or instantiate module: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing call_indirect overlong immediate: ' + (e.message || e));
  }
}

loadSDK(runTest);
