function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createBox(top, left, opacity, color) {
  var $box = document.createElement('div');
  $box.style.width = '100px';
  $box.style.height = '100px';
  $box.style.position = 'absolute';
  $box.style.top = top;
  $box.style.left = left;
  $box.style.opacity = opacity;
  $box.style.backgroundColor = color;
  return $box;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.position = 'relative';
  $container.style.width = '150px';
  $container.style.height = '150px';

  var $box1 = createBox('0', '0', '1', '#ff0000');
  $container.appendChild($box1);

  var $box2 = createBox('50px', '50px', '0.5', '#00ff00');
  $container.appendChild($box2);

  act.render($container, function () {
    act
      .ask('Is there a partly transparent green box overlapping a red box?')
      .send(function (answer) {
        answer ? act.success() : act.fail('Opacity is not supported.');
      });
  });
}

loadSDK(runTest);
