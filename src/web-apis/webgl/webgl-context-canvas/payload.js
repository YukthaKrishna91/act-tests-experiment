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

  var canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;

  var $container = document.createElement('div');
  $container.appendChild(canvas);

  act.render($container, function () {
    try {
      var gl = canvas.getContext('webgl');

      if (!gl) {
        act.fail('canvas.getContext("webgl") returned null');
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
      act.fail('Error obtaining WebGL context: ' + (e.message || e));
    }
  });
}

loadSDK(runTest);
