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

    if (typeof WebAssembly.Instance !== 'function') {
      act.fail('WebAssembly.Instance is not a function');
      return;
    }

    fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-instance-constructor/module.wasm')
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        var module = new WebAssembly.Module(bytes);
        var instance = new WebAssembly.Instance(module, {});

        if (!(instance instanceof WebAssembly.Instance)) {
          act.fail('Result is not an instance of WebAssembly.Instance');
          return;
        }

        if (!instance.exports || typeof instance.exports !== 'object') {
          act.fail('Instance does not have exports object');
          return;
        }

        if (typeof instance.exports.add !== 'function') {
          act.fail('Exported add function not found');
          return;
        }

        var sum = instance.exports.add(10, 20);
        if (sum !== 30) {
          act.fail('add(10, 20) returned ' + sum + ', expected 30');
          return;
        }

        act.success();
      })
      .catch(function (e) {
        act.fail('Failed to fetch module.wasm: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing WebAssembly.Instance constructor: ' + (e.message || e));
  }
}

loadSDK(runTest);
