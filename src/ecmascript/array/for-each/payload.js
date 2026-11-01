'use strict';

function loadSDK(callback) {
  const script = document.createElement('script');
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
    var tvBrands = ['Samsung', 'LG', 'Sony', 'Panasonic', 'Toshiba'];
    var output = '';
    var expected = 'Samsung, LG, Sony, Panasonic, Toshiba, ';

    tvBrands.forEach(function (brand) {
      output += brand + ', ';
    });

    if (output === expected) {
      act.success();
    } else {
      act.fail(`Array.prototype.forEach() failed to work as expected`);
    }
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
