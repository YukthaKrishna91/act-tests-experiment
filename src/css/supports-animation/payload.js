function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createBox() {
  var $box = document.createElement('div');
  $box.style.width = '100px';
  $box.style.height = '100px';
  $box.style.backgroundColor = '#ff0000';
  $box.style.position = 'absolute';
  return $box;
}

var animationCounter = 0;

function injectKeyframes(keyframes) {
  var $style = document.createElement('style');
  var animationId = 'Animation' + animationCounter++;
  var css = ['@keyframes ' + animationId + ' {', keyframes.join('\n'), '}'].join('\n');
  if ($style.styleSheet) {
    $style.styleSheet.cssText = css;
  } else {
    $style.appendChild(document.createTextNode(css));
  }
  document.head.appendChild($style);
  return animationId;
}

function runTest() {
  act.start();

  var $box = createBox();

  var animationName = injectKeyframes([
    'from {',
    '  opacity: 1;',
    '  transform: translateX(0) translateY(0)',
    '}',
    'to {',
    '  opacity: 0.1;',
    '  transform: translateX(200px) translateY(100px)',
    '}'
  ]);

  $box.style.animation = animationName + ' 0.5s linear 0s alternate infinite';

  act.render($box, function () {
    act
      .ask(
        'Is there a square sliding from high left to middle right, and then the reverse? It should also fade to 10% opacity when it is on the right.'
      )
      .send(function (answer) {
        answer ? act.success() : act.fail('CSS animations are not supported.');
      });
  });
}

loadSDK(runTest);
