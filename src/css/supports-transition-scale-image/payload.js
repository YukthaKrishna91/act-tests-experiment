function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.position = 'relative';
  $container.style.height = '200px';
  $container.style.textAlign = 'left';

  var $el = document.createElement('div');
  $el.style.backgroundImage =
    'url("/act/test/monorepo/latest/css/supports-transition-scale-image/test-card.jpg")';
  $el.style.backgroundRepeat = 'none';
  $el.style.backgroundSize = 'cover';
  $el.style.borderStyle = 'solid';
  $el.style.borderWidth = '2px';
  $el.style.marginTop = '100px';
  $el.style.borderColor = 'red';
  $el.style.width = '160px';
  $el.style.height = '90px';
  $el.style.transform = 'translateX(0) scale(1)';
  $el.style.transition = 'transform 0.5s';

  $container.appendChild($el);

  var animationToggle = false;

  setInterval(function () {
    animationToggle = !animationToggle;
    $el.style.transform = animationToggle ? 'translateX(300px) scale(3)' : 'translateX(0) scale(1)';
  }, 1500);

  act.render($container, function () {
    act
      .ask(
        'Does the test card scale up and move to the right smoothly and not go blurry, and then the reverse? The image shoud not change at all whilst it is still. I.e. it going from blurry to sharp whilst it is not moving is a fail. Also if the image snaps instantly between the 2 sizes without transitioning between them, this is a failure.'
      )
      .send(function (answer) {
        answer ? act.success() : act.fail('Quality is lost when transitions scale an image.');
      });
  });
}

loadSDK(runTest);
