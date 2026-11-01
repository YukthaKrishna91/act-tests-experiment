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

    if (typeof WebAssembly.Table !== 'function') {
      act.fail('WebAssembly.Table is not a function');
      return;
    }

    var table = new WebAssembly.Table({ initial: 2, element: 'anyfunc' });

    if (!(table instanceof WebAssembly.Table)) {
      act.fail('Result is not an instance of WebAssembly.Table');
      return;
    }

    if (table.length !== 2) {
      act.fail('table.length is ' + table.length + ', expected 2');
      return;
    }

    if (typeof table.get !== 'function') {
      act.fail('table.get is not a function');
      return;
    }

    if (typeof table.set !== 'function') {
      act.fail('table.set is not a function');
      return;
    }

    // Empty slots should return null
    if (table.get(0) !== null) {
      act.fail('table.get(0) returned ' + table.get(0) + ', expected null');
      return;
    }

    act.success();
  } catch (e) {
    act.fail('Error testing WebAssembly.Table constructor: ' + (e.message || e));
  }
}

loadSDK(runTest);
