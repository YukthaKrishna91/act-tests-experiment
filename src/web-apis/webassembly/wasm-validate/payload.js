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

    if (typeof WebAssembly.validate !== 'function') {
      act.fail('WebAssembly.validate is not a function');
      return;
    }

    fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-validate/module.wasm')
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        var validResult = WebAssembly.validate(bytes);
        if (validResult !== true) {
          act.fail(
            'WebAssembly.validate() returned ' + validResult + ' for valid bytecode, expected true'
          );
          return;
        }

        /* Invalid: corrupted magic number */
        var invalidBytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);

        var invalidResult = WebAssembly.validate(invalidBytes);
        if (invalidResult !== false) {
          act.fail(
            'WebAssembly.validate() returned ' +
              invalidResult +
              ' for invalid bytecode, expected false'
          );
          return;
        }

        act.success();
      })
      .catch(function (e) {
        act.fail('Failed to fetch module.wasm: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing WebAssembly.validate(): ' + (e.message || e));
  }
}

loadSDK(runTest);
