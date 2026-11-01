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

    fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-i64-return/module.wasm')
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        return WebAssembly.instantiate(bytes, {});
      })
      .then(function (result) {
        var get64 = result.instance.exports.get64;
        var output = get64();

        if (typeof output !== 'bigint') {
          act.fail('i64 return type is ' + typeof output + ', expected bigint');
          return;
        }

        var expected = BigInt('9007199254740993');

        if (output !== expected) {
          act.fail('get64() returned ' + output.toString() + ', expected 9007199254740993');
          return;
        }

        act.success();
      })
      .catch(function (e) {
        act.fail('Failed to instantiate module: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing i64 return: ' + (e.message || e));
  }
}

loadSDK(runTest);
