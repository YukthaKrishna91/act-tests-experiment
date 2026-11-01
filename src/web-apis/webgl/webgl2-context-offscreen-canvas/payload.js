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
    if (typeof OffscreenCanvas === 'undefined') {
      act.fail('OffscreenCanvas is not supported in this environment');
      return;
    }

    if (typeof WebGL2RenderingContext === 'undefined') {
      act.fail('WebGL2RenderingContext is not defined in this environment');
      return;
    }

    var offscreenCanvas = new OffscreenCanvas(256, 256);

    var gl2 = offscreenCanvas.getContext('webgl2');

    if (!gl2) {
      act.fail('OffscreenCanvas.getContext("webgl2") returned null');
      return;
    }

    if (!(gl2 instanceof WebGL2RenderingContext)) {
      act.fail('Returned context is not an instance of WebGL2RenderingContext');
      return;
    }

    var version = gl2.getParameter(gl2.VERSION);
    if (typeof version !== 'string' || version.indexOf('WebGL 2') === -1) {
      act.fail('WebGL2 context VERSION does not indicate WebGL 2.0');
      return;
    }

    act.success();
  } catch (e) {
    act.fail('Error obtaining WebGL2 context from OffscreenCanvas: ' + (e.message || e));
  }
}

loadSDK(runTest);
