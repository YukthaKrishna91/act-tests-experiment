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
  $container.style.backgroundColor = 'transparent';
  $container.style.width = '100%';
  $container.style.height = '100%';
  $container.style.display = 'table';

  var $cell = document.createElement('div');
  $cell.style.display = 'table-cell';
  $cell.style.verticalAlign = 'middle';
  $cell.style.textAlign = 'center';

  var $stage = document.createElement('div');
  $stage.style.position = 'relative';
  $stage.style.display = 'inline-block';
  $stage.style.width = '820px';
  $stage.style.height = '380px';
  $stage.style.textAlign = 'left';

  var $el = document.createElement('div');
  $el.style.backgroundImage =
    'url("/act/test/monorepo/latest/css/supports-transition-scale-image-with-broadcast/test-card.jpg")';
  $el.style.backgroundRepeat = 'no-repeat';
  $el.style.backgroundSize = 'cover';
  $el.style.borderStyle = 'solid';
  $el.style.borderWidth = '2px';
  $el.style.marginTop = '100px';
  $el.style.borderColor = 'red';
  $el.style.width = '160px';
  $el.style.height = '90px';
  $el.style.transform = 'translateX(0) scale(1)';
  $el.style.transition = 'transform 0.5s';

  $stage.appendChild($el);
  $cell.appendChild($stage);
  $container.appendChild($cell);

  var animationToggle = false;

  setInterval(function () {
    animationToggle = !animationToggle;
    $el.style.transform = animationToggle ? 'translateX(300px) scale(3)' : 'translateX(0) scale(1)';
  }, 1500);

  act.render($container, function () {
    act
      .ask(
        'With broadcast background, does the test card smoothly scale up and move to the right, then smoothly return, without becoming blurry? While the card is still, the image should stay stable. If it changes from blurry to sharp while not moving, or snaps between sizes instead of transitioning, the test fails.'
      )
      .send(function (answer) {
        answer ? act.success() : act.fail('Quality is lost when transitions scale an image.');
      });
  });
}

loadSDK(runTest);
