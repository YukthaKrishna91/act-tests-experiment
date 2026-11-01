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

    if (typeof WebAssembly.Global !== 'function') {
      act.fail('WebAssembly.Global is not a function');
      return;
    }

    var global = new WebAssembly.Global({ value: 'i32', mutable: false }, 42);

    if (!(global instanceof WebAssembly.Global)) {
      act.fail('Result is not an instance of WebAssembly.Global');
      return;
    }

    if (global.value !== 42) {
      act.fail('global.value is ' + global.value + ', expected 42');
      return;
    }

    if (typeof global.valueOf !== 'function') {
      act.fail('global.valueOf is not a function');
      return;
    }

    if (global.valueOf() !== 42) {
      act.fail('global.valueOf() returned ' + global.valueOf() + ', expected 42');
      return;
    }

    act.success();
  } catch (e) {
    act.fail('Error testing WebAssembly.Global constructor: ' + (e.message || e));
  }
}

loadSDK(runTest);
