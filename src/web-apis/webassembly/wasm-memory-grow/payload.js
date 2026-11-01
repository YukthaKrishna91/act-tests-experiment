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

    var memory = new WebAssembly.Memory({ initial: 1, maximum: 10 });

    if (typeof memory.grow !== 'function') {
      act.fail('memory.grow is not a function');
      return;
    }

    var oldPages = memory.grow(2);

    if (oldPages !== 1) {
      act.fail('memory.grow() returned ' + oldPages + ', expected 1 (previous page count)');
      return;
    }

    // After growing by 2 pages, total should be 3 pages = 3 * 64KB = 196608 bytes
    if (memory.buffer.byteLength !== 196608) {
      act.fail(
        'After grow(2), buffer.byteLength is ' + memory.buffer.byteLength + ', expected 196608'
      );
      return;
    }

    act.success();
  } catch (e) {
    act.fail('Error testing WebAssembly.Memory.grow(): ' + (e.message || e));
  }
}

loadSDK(runTest);
