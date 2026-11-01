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
    if (typeof WebAssembly !== 'object') {
      act.fail('WebAssembly global object does not exist');
      return;
    }

    if (typeof WebAssembly.compile !== 'function') {
      act.fail('WebAssembly.compile is not a function');
      return;
    }

    fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-compile/module.wasm')
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        var result = WebAssembly.compile(bytes);

        if (!(result instanceof Promise)) {
          act.fail('WebAssembly.compile() did not return a Promise');
          return;
        }

        result
          .then(function (module) {
            if (!(module instanceof WebAssembly.Module)) {
              act.fail('Promise resolved to ' + typeof module + ', expected WebAssembly.Module');
              return;
            }
            act.success();
          })
          .catch(function (e) {
            act.fail('WebAssembly.compile() Promise rejected: ' + (e.message || e));
          });
      })
      .catch(function (e) {
        act.fail('Failed to fetch module.wasm: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing WebAssembly.compile(): ' + (e.message || e));
  }
}

loadSDK(runTest);
