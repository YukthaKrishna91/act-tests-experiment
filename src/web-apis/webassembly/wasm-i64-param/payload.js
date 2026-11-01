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
    if (typeof BigInt !== 'function') {
      act.fail('BigInt is not supported in this environment');
      return;
    }

    fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-i64-param/module.wasm')
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        return WebAssembly.instantiate(bytes, {});
      })
      .then(function (result) {
        var add64 = result.instance.exports.add64;

        // Test with small BigInt values
        var result1 = add64(BigInt(1), BigInt(2));
        if (result1 !== BigInt(3)) {
          act.fail('add64(1n, 2n) returned ' + result1.toString() + ', expected 3');
          return;
        }

        // Test with large values beyond Number.MAX_SAFE_INTEGER
        var large1 = BigInt('9007199254740992'); // 2^53
        var large2 = BigInt('1');
        var result2 = add64(large1, large2);
        var expected2 = BigInt('9007199254740993');

        if (result2 !== expected2) {
          act.fail(
            'add64(2^53, 1) returned ' + result2.toString() + ', expected ' + expected2.toString()
          );
          return;
        }

        // Test with negative values
        var result3 = add64(BigInt(-100), BigInt(50));
        if (result3 !== BigInt(-50)) {
          act.fail('add64(-100n, 50n) returned ' + result3.toString() + ', expected -50');
          return;
        }

        act.success();
      })
      .catch(function (e) {
        act.fail('Failed to instantiate module: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing i64 param: ' + (e.message || e));
  }
}

loadSDK(runTest);
