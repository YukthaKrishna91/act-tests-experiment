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

    if (typeof WebAssembly.compileStreaming !== 'function') {
      act.fail('WebAssembly.compileStreaming is not a function');
      return;
    }

    var result = WebAssembly.compileStreaming(
      fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-compile-streaming/module.wasm')
    );

    if (!(result instanceof Promise)) {
      act.fail('WebAssembly.compileStreaming() did not return a Promise');
      return;
    }

    result
      .then(function (module) {
        if (!(module instanceof WebAssembly.Module)) {
          act.fail('Promise resolved to ' + typeof module + ', expected WebAssembly.Module');
          return;
        }
        act.success();
      })
      .catch(function (e) {
        act.fail('WebAssembly.compileStreaming() Promise rejected: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing WebAssembly.compileStreaming(): ' + (e.message || e));
  }
}

loadSDK(runTest);
