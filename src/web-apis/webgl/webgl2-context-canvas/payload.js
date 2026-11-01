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
      if (typeof WebGL2RenderingContext === 'undefined') {
        act.fail('WebGL2RenderingContext is not defined in this environment');
        return;
      }

      var gl2 = canvas.getContext('webgl2');

      if (!gl2) {
        act.fail('canvas.getContext("webgl2") returned null');
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
      act.fail('Error obtaining WebGL2 context: ' + (e.message || e));
    }
  });
}

loadSDK(runTest);
