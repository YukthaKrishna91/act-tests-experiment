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

    var global = new WebAssembly.Global({ value: 'i32', mutable: true }, 10);

    if (global.value !== 10) {
      act.fail('Initial global.value is ' + global.value + ', expected 10');
      return;
    }

    global.value = 99;

    if (global.value !== 99) {
      act.fail('After assignment, global.value is ' + global.value + ', expected 99');
      return;
    }

    // Test that immutable globals throw on assignment
    var immutableGlobal = new WebAssembly.Global({ value: 'i32', mutable: false }, 5);
    var threwError = false;

    try {
      immutableGlobal.value = 100;
    } catch (e) {
      threwError = true;
      act.log('Error thrown when assigning to immutable global: ' + (e.message || e));
    }

    if (!threwError) {
      act.fail('Assigning to immutable global did not throw an error');
      return;
    }

    act.success();
  } catch (e) {
    act.fail('Error testing mutable WebAssembly.Global: ' + (e.message || e));
  }
}

loadSDK(runTest);
