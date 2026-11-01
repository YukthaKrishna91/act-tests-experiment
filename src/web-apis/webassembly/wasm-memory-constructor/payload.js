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

    if (typeof WebAssembly.Memory !== 'function') {
      act.fail('WebAssembly.Memory is not a function');
      return;
    }

    var memory = new WebAssembly.Memory({ initial: 1, maximum: 10 });

    if (!(memory instanceof WebAssembly.Memory)) {
      act.fail('Result is not an instance of WebAssembly.Memory');
      return;
    }

    if (!(memory.buffer instanceof ArrayBuffer)) {
      act.fail('memory.buffer is not an ArrayBuffer');
      return;
    }

    // 1 page = 64KB = 65536 bytes
    if (memory.buffer.byteLength !== 65536) {
      act.fail('memory.buffer.byteLength is ' + memory.buffer.byteLength + ', expected 65536');
      return;
    }

    act.success();
  } catch (e) {
    act.fail('Error testing WebAssembly.Memory constructor: ' + (e.message || e));
  }
}

loadSDK(runTest);
