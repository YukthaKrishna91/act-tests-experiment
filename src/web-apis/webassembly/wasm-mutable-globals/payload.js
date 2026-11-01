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
    fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-mutable-globals/module.wasm')
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        return WebAssembly.instantiate(bytes, {});
      })
      .then(function (result) {
        var instance = result.instance;

        var initial = instance.exports.get();
        if (initial !== 0) {
          act.fail('Initial counter value is ' + initial + ', expected 0');
          return;
        }

        instance.exports.increment();

        var after1 = instance.exports.get();
        if (after1 !== 1) {
          act.fail('After increment, get() returned ' + after1 + ', expected 1');
          return;
        }

        instance.exports.increment();
        instance.exports.increment();

        var after3 = instance.exports.get();
        if (after3 !== 3) {
          act.fail('After 3 increments, get() returned ' + after3 + ', expected 3');
          return;
        }

        act.success();
      })
      .catch(function (e) {
        act.fail('Failed to instantiate module: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing mutable-globals: ' + (e.message || e));
  }
}

loadSDK(runTest);
