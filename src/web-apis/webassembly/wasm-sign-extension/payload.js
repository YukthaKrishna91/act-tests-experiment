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
    fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-sign-extension/module.wasm')
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        return WebAssembly.instantiate(bytes, {});
      })
      .then(function (result) {
        var extend8_s = result.instance.exports.extend8_s;

        // 0x7F (127) should stay 127
        var result1 = extend8_s(127);
        if (result1 !== 127) {
          act.fail('extend8_s(127) returned ' + result1 + ', expected 127');
          return;
        }

        // 0x80 (128) should become -128 (sign extended from 8-bit)
        var result2 = extend8_s(128);
        if (result2 !== -128) {
          act.fail('extend8_s(128) returned ' + result2 + ', expected -128');
          return;
        }

        // 0xFF (255) should become -1 (sign extended from 8-bit)
        var result3 = extend8_s(255);
        if (result3 !== -1) {
          act.fail('extend8_s(255) returned ' + result3 + ', expected -1');
          return;
        }

        act.success();
      })
      .catch(function (e) {
        act.fail('Failed to instantiate module: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing sign-extension: ' + (e.message || e));
  }
}

loadSDK(runTest);
