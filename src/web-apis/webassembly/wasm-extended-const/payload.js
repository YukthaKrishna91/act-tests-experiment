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
    fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-extended-const/module.wasm')
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        return WebAssembly.instantiate(bytes, {});
      })
      .then(function (result) {
        var sumGlobal = result.instance.exports.sum;
        var productGlobal = result.instance.exports.product;

        if (!sumGlobal || typeof sumGlobal.value === 'undefined') {
          act.fail('Exported "sum" is not a WebAssembly.Global with a .value property');
          return;
        }

        if (!productGlobal || typeof productGlobal.value === 'undefined') {
          act.fail('Exported "product" is not a WebAssembly.Global with a .value property');
          return;
        }

        if (sumGlobal.value !== 15) {
          act.fail(
            'sum global value is ' +
              sumGlobal.value +
              ', expected 15 from constant initialiser (i32.add 10 5)'
          );
          return;
        }

        if (productGlobal.value !== 42) {
          act.fail(
            'product global value is ' +
              productGlobal.value +
              ', expected 42 from constant initialiser (i32.mul 6 7)'
          );
          return;
        }

        act.success();
      })
      .catch(function (e) {
        act.fail('Failed to instantiate module: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing extended-const: ' + (e.message || e));
  }
}

loadSDK(runTest);
