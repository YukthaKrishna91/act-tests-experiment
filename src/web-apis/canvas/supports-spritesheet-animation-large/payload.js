function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var SpriteAnimation;
/* eslint-disable */
SpriteAnimation = (function (exports) {
  'use strict';
  function createBackgroundRenderer(_a) {
    var spriteUrl = _a.spriteUrl,
      spriteWidth = _a.spriteWidth,
      width = _a.width,
      height = _a.height;
    var $el = document.createElement('div');
    $el.style.backgroundImage = 'url(' + spriteUrl + ')';
    $el.style.backgroundPosition = '0px 0px';
    $el.style.backgroundSize = spriteWidth + 'px';
    $el.style.width = width + 'px';
    $el.style.height = height + 'px';
    var backgroundRenderer = {
      getEl: function () {
        return $el;
      },
      whenReady: function () {
        return new Promise(function (resolve, reject) {
          var img = new Image();
          img.onload = function () {
            return resolve();
          };
          img.onerror = function () {
            return reject(new Error('Image failed to load'));
          };
          img.src = spriteUrl;
        });
      },
      render: function (_a) {
        var frame = _a.frame,
          scale = _a.scale;
        $el.style.backgroundPosition = -1 * scale * frame[0] + 'px ' + -1 * scale * frame[1] + 'px';
        $el.style.backgroundSize = scale * spriteWidth + 'px';
        $el.style.width = width * scale + 'px';
        $el.style.height = height * scale + 'px';
      }
    };
    return backgroundRenderer;
  }
  function buildDeferred() {
    var resolve;
    var reject;
    var promise = new Promise(function (_resolve, _reject) {
      resolve = _resolve;
      reject = _reject;
    });
    return { promise: promise, resolve: resolve, reject: reject };
  }
  function isCanvasRendererSupported() {
    try {
      var elem = document.createElement('canvas');
      return !!(elem.getContext && elem.getContext('2d'));
    } catch (_a) {
      return false;
    }
  }
  function createCanvasRenderer(_a) {
    var spriteUrl = _a.spriteUrl,
      width = _a.width,
      height = _a.height;
    var $canvas = document.createElement('canvas');
    var context = $canvas.getContext('2d');
    var loaded = false;
    var queuedRenderOpts = null;
    var whenReady = buildDeferred();
    var img = new Image();
    img.onload = function () {
      whenReady.resolve();
      loaded = true;
      if (queuedRenderOpts) {
        render(queuedRenderOpts);
      }
    };
    img.onerror = function () {
      whenReady.reject(new Error('Image failed to load'));
    };
    img.src = spriteUrl;
    var render = function (renderOpts) {
      var frame = renderOpts.frame,
        scale = renderOpts.scale;
      var scaledWidth = width * scale;
      var scaledHeight = height * scale;
      $canvas.width = scaledWidth;
      $canvas.height = scaledHeight;
      if (!loaded) {
        queuedRenderOpts = renderOpts;
        return;
      }
      context.clearRect(0, 0, scaledWidth, scaledHeight);
      context.drawImage(img, frame[0], frame[1], width, height, 0, 0, scaledWidth, scaledHeight);
    };
    var canvasRenderer = {
      getEl: function () {
        return $canvas;
      },
      whenReady: function () {
        return whenReady.promise;
      },
      render: render
    };
    return canvasRenderer;
  }
  var supportsPerformanceNow = 'performance' in window && typeof performance.now === 'function';
  var maxSafeInteger = Number.MAX_SAFE_INTEGER || 9007199254740991;
  var minSafeInteger = Number.MIN_SAFE_INTEGER || -9007199254740991;
  function now() {
    return supportsPerformanceNow ? performance.now() : Date.now();
  }
  function wrap(input, size) {
    return ((input % size) + size) % size;
  }
  function clamp(input, min, max) {
    return Math.min(max, Math.max(min, input));
  }
  /**
   * Build the player.
   *
   * Takes an object with:
   * - config: the config object
   * - spriteUrl: the URL of the sprite
   * - disableBackgoundRendererFallback: enabling this will result in an error if <canvas /> is unsupported (optional)
   *
   * When you have finished you **must** set the rate to 0 with `update({ rate: 0 })`
   * to ensure it can be garbage collected. If you have enabled the `keepWarm` option
   * you **must** disable this too.
   *
   * Call `update({ rate: 1 })` to start the animation in a loop.
   */
  function buildPlayer(_a) {
    var config = _a.config,
      spriteUrl = _a.spriteUrl,
      _b = _a.disableBackgoundRendererFallback,
      disableBackgoundRendererFallback = _b === void 0 ? false : _b;
    if (config.version !== 1) {
      throw new Error('Unsupported config version: ' + config.version);
    }
    var frames = config.frames,
      frameRate = config.frameRate,
      width = config.width,
      height = config.height,
      spriteWidth = config.spriteWidth;
    var frameCount = frames.length;
    var buildRenderer = function () {
      if (isCanvasRendererSupported()) {
        return createCanvasRenderer({
          spriteUrl: spriteUrl,
          spriteWidth: spriteWidth,
          width: width,
          height: height
        });
      }
      if (disableBackgoundRendererFallback) {
        throw new Error('Canvas unsupported, and required.');
      }
      return createBackgroundRenderer({
        spriteUrl: spriteUrl,
        spriteWidth: spriteWidth,
        width: width,
        height: height
      });
    };
    var renderer = buildRenderer();
    var timeCorrelation = {
      startTime: now(),
      startFrame: 0,
      rate: 0
    };
    var minFrame = -Infinity;
    var maxFrame = Infinity;
    var scale = 1;
    var keepWarm = false;
    var calculateFrame = function () {
      var framesPerMs = (frameRate * timeCorrelation.rate) / 1000;
      var duration = frameCount / framesPerMs;
      var currentFrame;
      // Handle the frame number going out of range of a safe integer
      // For a 50fps animation it could happen in 5.7 million years...
      // Test with `player.seek(Number.MAX_SAFE_INTEGER)`
      while (true) {
        var startTime = timeCorrelation.startTime,
          startFrame = timeCorrelation.startFrame;
        var timePassed = now() - startTime;
        currentFrame = Math.floor(timePassed * framesPerMs) + startFrame;
        if (currentFrame > maxSafeInteger) {
          timeCorrelation.startTime += duration;
        } else if (currentFrame < minSafeInteger) {
          timeCorrelation.startTime -= duration;
        } else {
          break;
        }
      }
      var clampedFrame = clamp(currentFrame, minFrame, maxFrame);
      return clampedFrame;
    };
    var requestAnimationFrameHandle = null;
    var lastFrame = null;
    var lastScale = null;
    var render = function () {
      if (requestAnimationFrameHandle) {
        window.cancelAnimationFrame(requestAnimationFrameHandle);
        requestAnimationFrameHandle = null;
      }
      var rate = timeCorrelation.rate;
      var currentFrameNum = calculateFrame();
      var hitMinFrame = rate < 0 && currentFrameNum === minFrame;
      var hitMaxFrame = rate > 0 && currentFrameNum === maxFrame;
      if (keepWarm || (rate && !hitMinFrame && !hitMaxFrame)) {
        requestAnimationFrameHandle = requestAnimationFrame(render);
      }
      var localFrameNum = wrap(currentFrameNum, frameCount);
      if (!keepWarm && lastScale === scale && lastFrame === localFrameNum) {
        return;
      }
      lastScale = scale;
      lastFrame = localFrameNum;
      renderer.render({ frame: frames[localFrameNum], scale: scale });
    };
    var setWidth = function (_width) {
      scale = _width / width;
    };
    var setRate = function (rate) {
      var currentFrame = calculateFrame();
      timeCorrelation = {
        startTime: now(),
        startFrame: currentFrame,
        rate: rate
      };
    };
    var seek = function (frame) {
      timeCorrelation.startTime = now();
      timeCorrelation.startFrame = frame;
    };
    render();
    var player = {
      /**
       * Returns the 'div' element which contains the animation.
       *
       * Do not modify this element.
       */
      getEl: function () {
        return renderer.getEl();
      },
      /**
       * Returns total number of frames.
       */
      getFrameCount: function () {
        return frameCount;
      },
      /**
       * Returns the animations native frame rate (fps).
       */
      getFrameRate: function () {
        return frameRate;
      },
      /**
       * Get the current frame number
       */
      getFrameNumber: function () {
        return calculateFrame();
      },
      /**
       * Get the width (px) after scaling.
       */
      getWidth: function () {
        return width * scale;
      },
      /**
       * Get the height (px) after scaling.
       */
      getHeight: function () {
        return height * scale;
      },
      /**
       * Get the width before scaling (px)
       */
      getNativeWidth: function () {
        return width;
      },
      /**
       * Get the height before scaling (px)
       */
      getNativeHeight: function () {
        return height;
      },
      /**
       * Return the rate
       */
      getRate: function () {
        return timeCorrelation.rate;
      },
      /**
       * Returns `true` if the animation rate is not 0 and it has not hit
       * and frozen on the `minFrame`/`maxFrame`
       */
      isRunning: function () {
        var currentFrame = calculateFrame();
        var rate = timeCorrelation.rate;
        return !(
          rate === 0 ||
          (rate < 0 && currentFrame === minFrame) ||
          (rate > 0 && currentFrame === maxFrame)
        );
      },
      /**
       * This returns a promise that resolves when the animation is ready to play.
       *
       * It rejects if something goes wrong loading the sprite.
       *
       * You can start the animation before this resolves, but there may be nothing visible.
       */
      whenReady: function () {
        return renderer.whenReady();
      },
      /**
       * Update the animation. Takes an object with the following:
       * - frame: the frame to seek to
       * - minFrame: minimum frame (inclusive). The animation will freeze when it hits this
       * - maxFrame: maximum frame (inclusive). The animation will freeze when it hits this
       * - rate: the rate of the animation. 1 means run at the native frame rate. -1 means run in reverse
       * - width: the width (px). Height will be scaled proportionally
       * - keepWarm: when `true` we will keep rendering on every frame, even when nothing is changing.
       *             Use this as a last resort if the animation jumps when resuming because of a device GC'ing
       *             the image after being idle for a while. Remember to set to `false` when you are done.
       *
       * It also takes some helpers:
       * - loop: set to the number of times you'd like the animation to loop. Cannot be used with `minFrame` and `maxFrame`.
       *
       * Only provide the properties that you want to change.
       */
      update: function (_a) {
        var frame = _a.frame,
          _minFrame = _a.minFrame,
          _maxFrame = _a.maxFrame,
          rate = _a.rate,
          _width = _a.width,
          _keepWarm = _a.keepWarm,
          loop = _a.loop;
        if (loop !== undefined) {
          if (loop === Infinity) {
            _minFrame = -Infinity;
            _maxFrame = Infinity;
          } else {
            _minFrame = 0;
            _maxFrame = frameCount * loop - 1;
          }
        }
        if (_minFrame !== undefined) minFrame = _minFrame;
        if (_maxFrame !== undefined) maxFrame = _maxFrame;
        if (rate !== undefined) setRate(rate);
        if (frame !== undefined) seek(frame);
        if (_width !== undefined) setWidth(_width);
        if (_keepWarm !== undefined) keepWarm = _keepWarm;
        render();
      }
    };
    return player;
  }
  exports.buildPlayer = buildPlayer;
  Object.defineProperty(exports, '__esModule', { value: true });
  return exports;
})({});

/* eslint-enable */

function createBox(config) {
  var spriteUrl =
    '/act/test/monorepo/latest/web-apis/canvas/supports-spritesheet-animation-large/sprite.png';

  var player = SpriteAnimation.buildPlayer({
    spriteUrl: spriteUrl,
    config: config,
    disableBackgoundRendererFallback: true
  });
  var $box = document.createElement('div');
  $box.style.display = 'inline-block';
  $box.style.margin = '5px';
  $box.style.padding = '5px';
  $box.style.borderWidth = '2px';
  $box.style.borderStyle = 'solid';
  $box.style.borderColor = 'white';
  $box.style.backgroundColor = 'black';

  $box.appendChild(player.getEl());
  return { $el: $box, player: player };
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  var loadingSpinner = createBox({
    version: 1,
    frameRate: 25,
    width: 755,
    height: 294,
    spriteWidth: 4530,
    spriteHeight: 3822,
    frames: [
      [0, 0],
      [0, 294],
      [755, 0],
      [755, 294],
      [0, 588],
      [755, 588],
      [0, 882],
      [755, 882],
      [0, 1176],
      [755, 1176],
      [1510, 0],
      [1510, 294],
      [1510, 588],
      [1510, 882],
      [1510, 1176],
      [0, 1470],
      [755, 1470],
      [1510, 1470],
      [0, 1764],
      [755, 1764],
      [1510, 1764],
      [2265, 0],
      [2265, 294],
      [2265, 588],
      [2265, 882],
      [2265, 1176],
      [2265, 1470],
      [2265, 1764],
      [0, 2058],
      [755, 2058],
      [1510, 2058],
      [2265, 2058],
      [0, 2352],
      [755, 2352],
      [1510, 2352],
      [2265, 2352],
      [0, 2646],
      [755, 2646],
      [1510, 2646],
      [2265, 2646],
      [3020, 0],
      [3020, 294],
      [3020, 588],
      [3020, 882],
      [3020, 1176],
      [3020, 1470],
      [3020, 1764],
      [3020, 2058],
      [3020, 2352],
      [3020, 2646],
      [0, 2940],
      [755, 2940],
      [1510, 2940],
      [2265, 2940],
      [3020, 2940],
      [0, 3234],
      [755, 3234],
      [1510, 3234],
      [2265, 3234],
      [3020, 3234],
      [3775, 0],
      [3775, 294],
      [3775, 588],
      [3775, 882],
      [3775, 1176],
      [3775, 1470],
      [3775, 1764],
      [3775, 2058],
      [3775, 2352],
      [3775, 2646],
      [3775, 2940],
      [3775, 3234],
      [0, 3528],
      [755, 3528]
    ]
  });
  loadingSpinner.player.update({ rate: 1 });
  $container.appendChild(loadingSpinner.$el);

  act.render($container, function () {
    act
      .ask('Can you see the iPlayer logo animation? It should continue in a loop and be smooth.')
      .send(function (answer) {
        answer ? act.success() : act.fail();
      });
  });
}

loadSDK(runTest);
