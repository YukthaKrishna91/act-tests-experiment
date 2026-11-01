function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createTitle(text) {
  var $title = document.createElement('h2');
  $title.textContent = text;
  return $title;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.height = '100%';
  var $title1 = createTitle('SVG Paths');
  $container.appendChild($title1);

  var $svg = document.createElement('div');
  $svg.style.cssText =
    'display: inline-block; margin: 20px; vertical-align: top; width: 300px; height: 300px;';
  $svg.style.backgroundImage = 'url(/act/test/monorepo/latest/svg/supports-paths/shape.svg)';
  var $actualTitle = createTitle('Actual');
  $actualTitle.style.fontSize = '24px';
  $svg.appendChild($actualTitle);
  $container.appendChild($svg);

  var $expectedDiv = document.createElement('div');
  $expectedDiv.style.cssText =
    'display: inline-block; margin: 20px; vertical-align: top; width: 300px; height: 300px;';
  var $expectedTitle = createTitle('Expected');
  $expectedTitle.style.fontSize = '24px';
  var $expectedImage = document.createElement('img');
  $expectedImage.src = '/act/test/monorepo/latest/svg/supports-paths/expected.png';
  $expectedImage.style.cssText =
    'display: inline-block; vertical-align: top; height: 230px; width: 280px;';
  $expectedDiv.appendChild($expectedTitle);
  $expectedDiv.appendChild($expectedImage);
  $container.appendChild($expectedDiv);

  act.render($container, function () {
    act
      .ask('Do the images look identical? (Ignoring minor size differences)')
      .send(function (answer) {
        answer ? act.success() : act.fail('SVG paths are not fully supported.');
      });
  });
}

loadSDK(runTest);
