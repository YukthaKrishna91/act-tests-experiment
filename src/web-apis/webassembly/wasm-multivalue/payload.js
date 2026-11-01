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
    fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-multivalue/module.wasm')
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        return WebAssembly.instantiate(bytes, {});
      })
      .then(function (result) {
        var swap = result.instance.exports.swap;
        var output = swap(1, 2);

        if (!Array.isArray(output)) {
          act.fail(
            'swap(1, 2) returned ' +
              Object.prototype.toString.call(output) +
              ', expected a multi-value Array'
          );
          return;
        }

        if (output.length !== 2) {
          act.fail('swap(1, 2) returned an array of length ' + output.length + ', expected 2');
          return;
        }

        if (output[0] !== 2 || output[1] !== 1) {
          act.fail('swap(1, 2) returned [' + output[0] + ', ' + output[1] + '], expected [2, 1]');
          return;
        }

        act.success();
      })
      .catch(function (e) {
        act.fail('Failed to instantiate module: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing multivalue: ' + (e.message || e));
  }
}

loadSDK(runTest);
