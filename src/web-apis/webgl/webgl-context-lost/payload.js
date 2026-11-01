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
        act.fail('canvas.getContext("webgl") returned null - cannot test context lost event');
        return;
      }

      var contextLostFired = false;
      var testTimeout;

      canvas.addEventListener(
        'webglcontextlost',
        function (event) {
          contextLostFired = true;
          event.preventDefault();
          clearTimeout(testTimeout);
          act.success();
        },
        false
      );

      var loseContextExtension = gl.getExtension('WEBGL_lose_context');

      if (!loseContextExtension) {
        act.fail(
          'WEBGL_lose_context extension not available - cannot simulate context loss for testing'
        );
        return;
      }

      testTimeout = setTimeout(function () {
        if (!contextLostFired) {
          act.fail('webglcontextlost event did not fire within 3 seconds');
        }
      }, 3000);

      loseContextExtension.loseContext();
    } catch (e) {
      act.fail('Error testing webglcontextlost event: ' + (e.message || e));
    }
  });
}

loadSDK(runTest);
