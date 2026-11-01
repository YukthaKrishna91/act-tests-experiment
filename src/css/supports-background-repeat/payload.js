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
  $box.style.width = '200px';
  $box.style.height = '200px';
  $box.style.display = 'inline-block';
  $box.style.margin = '20px';
  return $box;
}

function createTitle(text) {
  var $title = document.createElement('h2');
  $title.style.cssText = 'display: inline-block; margin:20; padding:0; font-size: 24px;';
  $title.textContent = text;

  return $title;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');

  var $image = createBox();
  $image.style.backgroundImage =
    'url(/act/test/monorepo/latest/css/supports-background-repeat/expected.png)';
  $container.appendChild($image);
  var $imageTitle = createTitle('Expected result');
  $image.appendChild($imageTitle);

  var $imageRepeatX = createBox();
  $imageRepeatX.style.backgroundImage =
    'url(/act/test/monorepo/latest/css/supports-background-repeat/10px-x.png)';
  $imageRepeatX.style.backgroundRepeat = 'repeat-x';
  $container.appendChild($imageRepeatX);
  var $imageRepeatTitleX = createTitle('Repeat x');
  $imageRepeatX.appendChild($imageRepeatTitleX);

  var $imageRepeatY = createBox();
  $imageRepeatY.style.backgroundImage =
    'url(/act/test/monorepo/latest/css/supports-background-repeat/10px-y.png)';
  $imageRepeatY.style.backgroundRepeat = 'repeat-y';
  $container.appendChild($imageRepeatY);
  var $imageRepeatTitleY = createTitle('Repeat y');
  $imageRepeatY.appendChild($imageRepeatTitleY);

  act.render($container, function () {
    act
      .ask('Are the three images below identical? (Ignoring titles and positioning)')
      .send(function (answer) {
        answer ? act.success() : act.fail('Background repeat is not supported');
      });
  });
}

loadSDK(runTest);
