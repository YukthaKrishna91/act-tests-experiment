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
    fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-nontrapping-fptoint/module.wasm')
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        return WebAssembly.instantiate(bytes, {});
      })
      .then(function (result) {
        var trunc_f32 = result.instance.exports.trunc_f32;

        // Normal conversion: 42.7 -> 42
        var result1 = trunc_f32(42.7);
        if (result1 !== 42) {
          act.fail('trunc_f32(42.7) returned ' + result1 + ', expected 42');
          return;
        }

        // Negative: -42.7 -> -42
        var result2 = trunc_f32(-42.7);
        if (result2 !== -42) {
          act.fail('trunc_f32(-42.7) returned ' + result2 + ', expected -42');
          return;
        }

        // Overflow should saturate to i32 max (2147483647) instead of trapping
        var result3 = trunc_f32(3e10);
        if (result3 !== 2147483647) {
          act.fail('trunc_f32(3e10) returned ' + result3 + ', expected 2147483647 (saturated)');
          return;
        }

        // Negative overflow should saturate to i32 min (-2147483648)
        var result4 = trunc_f32(-3e10);
        if (result4 !== -2147483648) {
          act.fail('trunc_f32(-3e10) returned ' + result4 + ', expected -2147483648 (saturated)');
          return;
        }

        act.success();
      })
      .catch(function (e) {
        act.fail('Failed to instantiate module: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing nontrapping-fptoint: ' + (e.message || e));
  }
}

loadSDK(runTest);
