'use strict';

var result = {
  success: false,
  message: 'WebGL context test in worker did not complete'
};

try {
  if (typeof self.OffscreenCanvas !== 'function') {
    result.message = 'OffscreenCanvas is not available in the worker';
    self.postMessage(result);
  } else {
    var offscreenCanvas = new self.OffscreenCanvas(256, 256);
    var gl = offscreenCanvas.getContext('webgl');

    if (!gl) {
      result.message = 'OffscreenCanvas.getContext("webgl") returned null in worker';
      self.postMessage(result);
    } else if (!(gl instanceof WebGLRenderingContext)) {
      result.message = 'Returned context is not an instance of WebGLRenderingContext in worker';
      self.postMessage(result);
    } else {
      var vendor = gl.getParameter(gl.VENDOR);
      if (typeof vendor !== 'string') {
        result.message =
          'WebGL context is not functional in worker (VENDOR parameter not available)';
        self.postMessage(result);
      } else {
        result.success = true;
        result.message =
          'WebGLRenderingContext obtained successfully from OffscreenCanvas in web worker';
        self.postMessage(result);
      }
    }
  }
} catch (e) {
  result.message = 'Error testing WebGL in worker: ' + (e ? e.message : 'unknown error');
  self.postMessage(result);
}
