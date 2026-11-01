function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createImage(path, styles) {
  var $img = document.createElement('img');
  $img.src = path;
  $img.style.cssText = styles;
  return $img;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.height = '100%';

  var expectedText = document.createElement('p');
  expectedText.innerText = 'Expected rendering:';
  expectedText.style.margin = '20px';

  var actualText = document.createElement('p');
  actualText.innerText = 'Actual rendering:';
  actualText.style.margin = '20px';

  $container.appendChild(actualText);
  $container.appendChild(
    createImage(
      '/act/test/monorepo/latest/svg/supports-filter-blur/actual-blur.svg',
      'display: block; vertical-align: top; margin: 20px;'
    )
  );

  $container.appendChild(expectedText);
  $container.appendChild(
    createImage(
      '/act/test/monorepo/latest/svg/supports-filter-blur/expected-blur.png',
      'display: block; vertical-align: top; margin: 20px; width: 240px;'
    )
  );

  act.render($container, function () {
    act
      .ask("Do the circles under 'actual rendering' appear as it does under 'expected rendering'?")
      .send(function (answer) {
        answer ? act.success() : act.fail('Could not create blur effect using SVG filters');
      });
  });
}

loadSDK(runTest);
