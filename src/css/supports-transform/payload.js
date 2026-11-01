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

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.position = 'relative';
  $container.style.overflow = 'hidden';
  $container.style.width = '100px';
  $container.style.height = '100px';

  var $box = createBox();
  $box.style.left = '-100px';
  $box.style.transform = 'translateX(100px)';
  $container.appendChild($box);

  act.render($container, function () {
    act.ask('Is there a red square on screen?').send(function (answer) {
      answer ? act.success() : act.fail('CSS transform is not supported.');
    });
  });
}

loadSDK(runTest);
