function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var threshold = 30; // fps
var framesAllowedBelow = 40; // % of frames that can be below threshold
var fpsHistory = []; // fps History
var supportsRaf = true;
var framesBelowThreshold;
var prediction = '';

var animationTimings = ['ease', 'linear', 'ease-in', 'ease-out', 'cubic-bezier(0, 0, 0.15, 1)'];

function createBox() {
  var $box = document.createElement('div');
  $box.style.cssText =
    'display: inline-block; margin: 20px 20px 0 20px; ' +
    'padding: 20px; width: 100px; height: 100px; border: 2px solid blue;';
  return $box;
}

function createAnimation(id, curve /** timing function **/) {
  var $animBox = document.createElement('div');
  $animBox.id = id;
  $animBox.style.cssText =
    'text-align: center; background-color: red; width: 25px; height: 25px; margin: 0px;' +
    'transition: width 1s ' +
    curve +
    ', height 1s ' +
    curve +
    ', margin 1s ' +
    curve +
    ', background-color 1s ' +
    curve +
    '';

  var $innerAnimBox = document.createElement('div');
  $innerAnimBox.style.cssText =
    'position: relative; width: 80%; height: 80%; left: 10px; top: 10px; border: 2px solid white;';
  $animBox.appendChild($innerAnimBox);

  var $innerAnimBox2 = document.createElement('div');
  $innerAnimBox2.style.cssText =
    'position: relative; width: 60%; height: 60%; left: 10px; top: 10px; border: 2px solid white;';
  $innerAnimBox.appendChild($innerAnimBox2);

  var $animation = createBox();
  $animation.appendChild($animBox);

  return {
    $el: $animation,
    update: function (toggle) {
      $animBox.style.width = toggle ? '50px' : '25px';
      $animBox.style.height = toggle ? '50px' : '25px';
      $animBox.style.marginLeft = toggle ? '75px' : '0px';
      $animBox.style.marginTop = toggle ? '75px' : '0px';
      $animBox.style.backgroundColor = toggle ? 'red' : 'white';
    }
  };
}

function recordFps() {
  var timestamp = Date.now();
  var previous = timestamp;
  var fps = 0;
  var firstRun = true;

  function calculating() {
    previous = timestamp;
    timestamp = Date.now();
    fps = Math.round(1000 / (timestamp - previous));

    if (!firstRun) {
      // first diff on timestamp is usually zero for reasons
      fpsHistory.push(fps);
    }

    var $fps = document.getElementById('fps');
    $fps.innerText = 'FPS: ' + fps;
    firstRun = false;
    requestAnimationFrame(calculating);
  }

  try {
    requestAnimationFrame(calculating);
  } catch {
    supportsRaf = false;
    prediction =
      "This test was predicted to fail because: request animation frame isn't supported.";
  }
}

function calcAverage() {
  var sum = 0;
  fpsHistory.forEach(function (val) {
    sum += val;
  });
  return Math.floor(sum / fpsHistory.length);
}

function calcPrediction() {
  framesBelowThreshold = Math.floor(
    (fpsHistory.filter(function (val) {
      return val < threshold;
    }).length /
      fpsHistory.length) *
      100
  );
  return framesBelowThreshold < framesAllowedBelow;
}

function generateId() {
  return Math.random().toString(36).substring(2);
}

function addDial(container) {
  var $dial = createBox();
  $dial.style.verticalAlign = 'top';
  $dial.style.textAlign = 'center';
  $dial.style.position = 'absolute';
  $dial.style.top = '10px';
  $dial.style.right = '10px';
  $dial.style.zIndex = '1000';
  $dial.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';

  var $fps = document.createElement('h2');
  $fps.id = 'fps';
  $fps.style.color = 'white';
  $fps.style.position = 'relative';
  $fps.style.top = '12px';

  $dial.appendChild($fps);
  container.appendChild($dial);
}

function createAnimations(num) {
  var animations = [];
  for (var i = 0; i < num; i++) {
    var animationTiming = animationTimings[i % animationTimings.length];
    animations.push(createAnimation(generateId(), animationTiming));
  }
  return animations;
}

function runTest() {
  act.start();

  var animationToggle = false;
  var $container = document.createElement('div');
  $container.style.position = 'relative';
  $container.style.width = '100%';
  $container.style.textAlign = 'center';

  var nOfAnims = 15;
  var animations = createAnimations(nOfAnims);

  animations.forEach(function (anim) {
    $container.appendChild(anim.$el);
  });

  addDial($container);

  var toggleAnimations = function () {
    animationToggle = !animationToggle;
    animations.forEach(function (anim) {
      anim.update(animationToggle);
    });
  };

  act.render($container, function () {
    toggleAnimations();
    setInterval(toggleAnimations, 1000);
    recordFps();
    setTimeout(function () {
      var average = calcAverage();
      var predictedPass = calcPrediction();

      if (supportsRaf) {
        prediction = predictedPass
          ? 'This test predicted that the device would pass because less than ' +
            framesAllowedBelow +
            ' percent of frames were rendered below threshold (' +
            threshold +
            'fps). Average fps was ' +
            average
          : 'This test was predicted to fail because more than ' +
            framesAllowedBelow +
            ' percent of frames were rendered below threshold (' +
            threshold +
            'fps). ' +
            framesBelowThreshold +
            ' percent of frames in total were below threshold. ' +
            'Average fps was ' +
            average +
            '.';
      }

      var $prediction = document.createElement('h2');
      var $predictionContainer = document.createElement('div');
      $predictionContainer.style.cssText =
        'position: absolute; bottom: 10px; right: 10px; width: 400px; max-width: 90%; border: 2px solid red; background-color: rgba(0, 0, 0, 0.8); z-index: 1000;';
      $prediction.style.color = 'white';
      $prediction.style.position = 'relative';
      $prediction.style.margin = '20px';
      $prediction.style.fontSize = '16px';
      $prediction.innerText = prediction;
      $predictionContainer.appendChild($prediction);
      $container.appendChild($predictionContainer);

      act
        .ask('Do the animations animate smoothly in your subjective opinion?')
        .send(function (answer) {
          answer
            ? act.log('Passed subjective eye test. ' + prediction)
            : act.log('Failed subjective eye test. ' + prediction);
          answer ? act.success() : act.fail('Failed subjective eye test. ' + prediction);
        });
    }, 10000);
  });
}

loadSDK(runTest);
