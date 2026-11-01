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
    fetch('/act/test/monorepo/latest/web-apis/webassembly/wasm-bulk-memory/module.wasm')
      .then(function (response) {
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        return WebAssembly.instantiate(bytes, {});
      })
      .then(function (result) {
        var instance = result.instance;
        var mem = new Uint8Array(instance.exports.memory.buffer);

        // Test memory.fill: fill bytes 0-9 with value 0x42
        instance.exports.fill(0, 0x42, 10);

        for (var i = 0; i < 10; i++) {
          if (mem[i] !== 0x42) {
            act.fail('After fill, mem[' + i + '] is ' + mem[i] + ', expected 0x42');
            return;
          }
        }

        // Verify bytes after fill range are still 0
        if (mem[10] !== 0) {
          act.fail('mem[10] should be 0 after fill(0, 0x42, 10), got ' + mem[10]);
          return;
        }

        // Test memory.copy: copy bytes 0-9 to bytes 20-29
        instance.exports.copy(20, 0, 10);

        for (var j = 0; j < 10; j++) {
          if (mem[20 + j] !== 0x42) {
            act.fail('After copy, mem[' + (20 + j) + '] is ' + mem[20 + j] + ', expected 0x42');
            return;
          }
        }

        act.success();
      })
      .catch(function (e) {
        act.fail('Failed to instantiate module: ' + (e.message || e));
      });
  } catch (e) {
    act.fail('Error testing bulk-memory: ' + (e.message || e));
  }
}

loadSDK(runTest);
