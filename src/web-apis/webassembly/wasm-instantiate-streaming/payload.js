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

    if (typeof WebAssembly.instantiateStreaming !== 'function') {
      act.fail('WebAssembly.instantiateStreaming is not a function');
      return;
    }

    /*
    module.wasm contains:
    (module
      (func (export "add") (param i32 i32) (result i32)
        local.get 0
        local.get 1
        i32.add))
    */
    var result = WebAssembly.instantiateStreaming(
      fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-instantiate-streaming/module.wasm')
    );

    if (!(result instanceof Promise)) {
      act.fail('WebAssembly.instantiateStreaming() did not return a Promise');
      return;
    }

    result
      .then(function (obj) {
        if (!(obj.module instanceof WebAssembly.Module)) {
          act.fail('Result.module is not a WebAssembly.Module');
          return;
        }

        if (!(obj.instance instanceof WebAssembly.Instance)) {
          act.fail('Result.instance is not a WebAssembly.Instance');
          return;
        }

        var add = obj.instance.exports.add;
        if (typeof add !== 'function') {
          act.fail('Exported add is not a function');
          return;
        }

        var output = add(2, 3);
        if (output !== 5) {
          act.fail('add(2, 3) returned ' + output + ', expected 5');
          return;
        }

        act.success();
      })
      .catch(function (e) {
        act.fail('WebAssembly.instantiateStreaming() Promise rejected: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing WebAssembly.instantiateStreaming(): ' + (e.message || e));
  }
}

loadSDK(runTest);
