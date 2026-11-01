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
  $text.id = 'transitionTextSize';
  $text.innerText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
  $text.style.cssText =
    'display: block; color: black; font-size: 20px; font-weight: normal; text-align: left; transition: font-size 3s';

  function update() {
    var $el = document.getElementById('transitionTextSize');
    $el.style.cssText = animationToggle
      ? 'display: block; color: black; font-size: 40px; font-weight: normal; text-align: left; transition: font-size 3s'
      : 'display: block; color: black; font-size: 20px; font-weight: normal; text-align: left; transition: font-size 3s';
  }

  $container.appendChild($text);

  setInterval(function () {
    animationToggle = !animationToggle;
    update();
  }, 2000);

  act.render($container, function () {
    act
      .ask(
        'Font size should grow and shrink every 2 seconds. It should grow/shrink smoothly and not snap.'
      )
      .send(function (answer) {
        answer ? act.success() : act.fail('Font size was not able to be transitioned');
      });
  });
}

loadSDK(runTest);
