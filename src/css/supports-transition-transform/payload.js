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
  $container.style.width = '300px';
  $container.style.height = '200px';

  var $box = createBox();
  $box.style.transform = 'translateX(0) translateY(0)';
  $box.style.transition = 'opacity 0.5s, transform 0.5s';
  $container.appendChild($box);

  var animationToggle = false;

  setInterval(function () {
    animationToggle = !animationToggle;
    $box.style.transform = animationToggle
      ? 'translateX(200px) translateY(100px)'
      : 'translateX(0) translateY(0)';
    $box.style.opacity = animationToggle ? '0.1' : '1';
  }, 1000);

  act.render($container, function () {
    act
      .ask(
        'Is there a square sliding from high left to low right, pausing for half a second, and then the reverse? It should also fade to 10% opacity when it is on the right. It should not jump immediately between the 2 positions.'
      )
      .send(function (answer) {
        answer
          ? act.success()
          : act.fail(
              'Transition support does not exist and does not work with transform and opacity.'
            );
      });
  });
}

loadSDK(runTest);
