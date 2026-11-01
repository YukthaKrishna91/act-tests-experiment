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
  var $title1 = createTitle('SVG Shapes');
  $container.appendChild($title1);

  var $actual = document.createElement('div');
  $actual.style.cssText = 'display: inline-block; margin: 20px; vertical-align: top;';
  var $svg = document.createElement('div');
  var $actualTitle = createTitle('Actual');
  $actualTitle.style.fontSize = '24px';
  $actualTitle.style.marginLeft = '0';
  $actualTitle.style.textAlign = 'left';
  $svg.style.cssText = 'width: 300px; height: 300px;';
  $svg.style.backgroundImage = 'url(/act/test/monorepo/latest/svg/supports-shapes/shapes.svg)';
  $actual.appendChild($actualTitle);
  $actual.appendChild($svg);
  $container.appendChild($actual);

  var $expectedDiv = document.createElement('div');
  $expectedDiv.style.cssText = 'display: inline-block; margin: 20px; vertical-align: top;';
  var $expectedTitle = createTitle('Expected');
  $expectedTitle.style.fontSize = '24px';
  $expectedTitle.style.marginLeft = '0';
  $expectedTitle.style.textAlign = 'left';
  $expectedDiv.appendChild($expectedTitle);
  var $expectedImage = document.createElement('img');
  $expectedImage.src = '/act/test/monorepo/latest/svg/supports-shapes/expected.png';
  $expectedImage.style.cssText = 'display: inline-block; vertical-align: top;';
  $expectedDiv.appendChild($expectedImage);
  $container.appendChild($expectedDiv);

  act.render($container, function () {
    act
      .ask('Do the images look identical? (Ignoring minor size differences)')
      .send(function (answer) {
        answer ? act.success() : act.fail('SVG shapes are not fully supported.');
      });
  });
}

loadSDK(runTest);
