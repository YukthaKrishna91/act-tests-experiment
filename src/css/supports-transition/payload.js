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
  $container.style.width = '280px';
  $container.style.height = '150px';

  var $box = createBox();
  $box.style.left = '0';
  $box.style.top = '0';
  $box.style.width = '100px';
  $box.style.height = '100px';
  $box.style.transition = 'left 0.5s, top 0.5s, width 0.5s, height 0.5s';

  $container.appendChild($box);

  var animationToggle = false;

  setInterval(function () {
    animationToggle = !animationToggle;
    $box.style.left = animationToggle ? '200px' : '0';
    $box.style.top = animationToggle ? '100px' : '0';
    $box.style.width = animationToggle ? '80px' : '100px';
    $box.style.height = animationToggle ? '50px' : '100px';
  }, 1000);

  act.render($container, function () {
    act
      .ask(
        'Is there a square sliding from high left to low right, pausing for half a second, and then the reverse? It should also get smaller and become a horizontal rectangle when it is on the right. It must not be snapping between the start and end position without anything inbetween.'
      )
      .send(function (answer) {
        answer
          ? act.success()
          : act.fail("CSS transtion is not supported or doesn't work properly.");
      });
  });
}

loadSDK(runTest);
