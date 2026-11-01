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

  var animationToggle = false;

  var $container = document.createElement('div');
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.height = '100%';

  var $text = document.createElement('h2');
  $text.id = 'transitionTextColor';
  $text.innerText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
  $text.style.cssText =
    'display: block; color: blue; font-size: 36px; font-weight: bold; text-align: left; transition: color 1s';

  function update() {
    var $el = document.getElementById('transitionTextColor');
    $el.style.cssText = animationToggle
      ? 'display: block; color: red; font-size: 36px; font-weight: bold; text-align: left; transition: color 1s'
      : 'display: block; color: blue; font-size: 36px; font-weight: bold; text-align: left; transition: color 1s';
  }

  $container.appendChild($text);

  setInterval(function () {
    animationToggle = !animationToggle;
    update();
  }, 2000);

  act.render($container, function () {
    act
      .ask(
        'Text should continuously fade from blue to red and back again every 2 seconds. Colors should fade into each other smoothly and not snap.'
      )
      .send(function (answer) {
        answer ? act.success() : act.fail('Font color was not able to be transitioned');
      });
  });
}

loadSDK(runTest);
