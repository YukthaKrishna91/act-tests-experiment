'use strict';

var result = {
  success: false,
  message: 'WebGL2 context test in worker did not complete'
};

try {
  if (typeof self.OffscreenCanvas !== 'function') {
    result.message = 'OffscreenCanvas is not available in the worker';
    self.postMessage(result);
  } else if (typeof WebGL2RenderingContext === 'undefined') {
    result.message = 'WebGL2RenderingContext is not defined in the worker environment';
    self.postMessage(result);
  } else {
    var offscreenCanvas = new self.OffscreenCanvas(256, 256);
    var gl2 = offscreenCanvas.getContext('webgl2');

    if (!gl2) {
      result.message = 'OffscreenCanvas.getContext("webgl2") returned null in worker';
      self.postMessage(result);
    } else if (!(gl2 instanceof WebGL2RenderingContext)) {
      result.message = 'Returned context is not an instance of WebGL2RenderingContext in worker';
      self.postMessage(result);
    } else {
      var version = gl2.getParameter(gl2.VERSION);
      if (typeof version !== 'string' || version.indexOf('WebGL 2') === -1) {
        result.message = 'WebGL2 context VERSION does not indicate WebGL 2.0 in worker';
        self.postMessage(result);
      } else {
        result.success = true;
        result.message =
          'WebGL2RenderingContext obtained successfully from OffscreenCanvas in web worker';
        self.postMessage(result);
      }
    }
  }
} catch (e) {
  result.message = 'Error testing WebGL2 in worker: ' + (e ? e.message : 'unknown error');
  self.postMessage(result);
}
