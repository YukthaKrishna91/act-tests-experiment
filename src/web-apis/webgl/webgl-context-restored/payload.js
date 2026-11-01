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
        act.fail('canvas.getContext("webgl") returned null - cannot test context restored event');
        return;
      }

      var contextLostFired = false;
      var contextRestoredFired = false;
      var loseContextExtension = null;
      var testTimeout;

      canvas.addEventListener(
        'webglcontextlost',
        function (event) {
          contextLostFired = true;
          event.preventDefault();

          setTimeout(function () {
            if (loseContextExtension) {
              loseContextExtension.restoreContext();
            }
          }, 100);
        },
        false
      );

      canvas.addEventListener(
        'webglcontextrestored',
        function () {
          contextRestoredFired = true;
          clearTimeout(testTimeout);
          if (contextLostFired) {
            act.success();
          } else {
            act.fail('webglcontextrestored fired but webglcontextlost did not fire first');
          }
        },
        false
      );

      loseContextExtension = gl.getExtension('WEBGL_lose_context');

      if (!loseContextExtension) {
        act.fail(
          'WEBGL_lose_context extension not available - cannot simulate context loss/restore for testing'
        );
        return;
      }

      testTimeout = setTimeout(function () {
        if (!contextLostFired) {
          act.fail('webglcontextlost event did not fire within 5 seconds');
        } else if (!contextRestoredFired) {
          act.fail('webglcontextrestored event did not fire within 5 seconds after context loss');
        }
      }, 5000);

      loseContextExtension.loseContext();
    } catch (e) {
      act.fail('Error testing webglcontextrestored event: ' + (e.message || e));
    }
  });
}

loadSDK(runTest);
