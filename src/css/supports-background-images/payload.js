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
  $box.style.width = '300px';
  $box.style.height = '200px';
  $box.style.display = 'inline-block';
  $box.style.margin = '10px';
  return $box;
}

function createImage(image) {
  var $image = document.createElement('img');
  $image.src = image;
  $image.style.cssText = 'display: inline-block; width: 300px; height: 200px; margin: 10px;';
  return $image;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');

  var $box = createBox();
  $box.style.backgroundImage =
    'url(/act/test/monorepo/latest/css/supports-background-images/red.png), url(/act/test/monorepo/latest/css/supports-background-images/blue.png), url(/act/test/monorepo/latest/css/supports-background-images/green.png)';
  $container.appendChild($box);

  var $image = createImage('/act/test/monorepo/latest/css/supports-background-images/expected.png');
  $container.appendChild($image);

  act.render($container, function () {
    act
      .ask('Do you see two matching images with the colours red, blue, green?')
      .send(function (answer) {
        answer ? act.success() : act.fail('Unable to render layered background images correctly.');
      });
  });
}

loadSDK(runTest);
