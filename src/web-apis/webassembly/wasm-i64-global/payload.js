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
    // Check BigInt support
    if (typeof BigInt !== 'function') {
      act.fail('BigInt is not supported in this environment');
      return;
    }

    // Create an i64 global with BigInt value
    var global = new WebAssembly.Global({ value: 'i64', mutable: true }, BigInt(42));

    if (!(global instanceof WebAssembly.Global)) {
      act.fail('Result is not an instance of WebAssembly.Global');
      return;
    }

    // Check value type
    if (typeof global.value !== 'bigint') {
      act.fail('global.value type is ' + typeof global.value + ', expected bigint');
      return;
    }

    // Check initial value
    if (global.value !== BigInt(42)) {
      act.fail('global.value is ' + global.value.toString() + ', expected 42');
      return;
    }

    // Test mutation with large BigInt
    var largeValue = BigInt('9223372036854775807'); // i64 max
    global.value = largeValue;

    if (global.value !== largeValue) {
      act.fail('After setting to i64 max, global.value is ' + global.value.toString());
      return;
    }

    // Test with negative value
    global.value = BigInt(-1);
    if (global.value !== BigInt(-1)) {
      act.fail('After setting to -1, global.value is ' + global.value.toString());
      return;
    }

    act.success();
  } catch (e) {
    act.fail('Error testing i64 Global: ' + (e.message || e));
  }
}

loadSDK(runTest);
