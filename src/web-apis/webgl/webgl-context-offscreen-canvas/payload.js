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

    var offscreenCanvas = new OffscreenCanvas(256, 256);

    var gl = offscreenCanvas.getContext('webgl');

    if (!gl) {
      act.fail('OffscreenCanvas.getContext("webgl") returned null');
      return;
    }

    if (!(gl instanceof WebGLRenderingContext)) {
      act.fail('Returned context is not an instance of WebGLRenderingContext');
      return;
    }

    var vendor = gl.getParameter(gl.VENDOR);
    if (typeof vendor !== 'string') {
      act.fail('WebGL context is not functional (VENDOR parameter not available)');
      return;
    }

    act.success();
  } catch (e) {
    act.fail('Error obtaining WebGL context from OffscreenCanvas: ' + (e.message || e));
  }
}

loadSDK(runTest);
