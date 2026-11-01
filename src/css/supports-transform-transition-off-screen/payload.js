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

  var $box = createBox();
  $box.style.transform = 'translateY(-210px)';
  $box.style.transition = 'transform 1s';
  $box.style.right = '100px';

  $container.appendChild($box);

  var animationToggle = false;

  setInterval(function () {
    animationToggle = !animationToggle;
    $box.style.transform = animationToggle ? 'translateY(100px)' : 'translateY(-210px)';
  }, 1500);

  act.render($container, function () {
    act
      .ask(
        'Is there a solid square sliding down from the top right of the screen, pausing for half a second, and then back up again? There should be no flashing.'
      )
      .send(function (answer) {
        answer
          ? act.success()
          : act.fail('CSS transition does not work properly when starting off screen.');
      });
  });
}

loadSDK(runTest);
