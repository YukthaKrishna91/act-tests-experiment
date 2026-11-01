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

    if (typeof WebAssembly.instantiate !== 'function') {
      act.fail('WebAssembly.instantiate is not a function');
      return;
    }

    fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-instantiate-bytes/module.wasm')
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        return WebAssembly.instantiate(bytes, {});
      })
      .then(function (result) {
        if (!result || typeof result !== 'object') {
          act.fail('WebAssembly.instantiate() did not return an object');
          return;
        }

        if (!(result.module instanceof WebAssembly.Module)) {
          act.fail('Result.module is not a WebAssembly.Module');
          return;
        }

        if (!(result.instance instanceof WebAssembly.Instance)) {
          act.fail('Result.instance is not a WebAssembly.Instance');
          return;
        }

        if (typeof result.instance.exports.add !== 'function') {
          act.fail('Exported add function not found');
          return;
        }

        var sum = result.instance.exports.add(2, 3);
        if (sum !== 5) {
          act.fail('add(2, 3) returned ' + sum + ', expected 5');
          return;
        }

        act.success();
      })
      .catch(function (e) {
        act.fail('WebAssembly.instantiate() Promise rejected: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing WebAssembly.instantiate(): ' + (e.message || e));
  }
}

loadSDK(runTest);
