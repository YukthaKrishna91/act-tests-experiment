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
      '/act/test/monorepo/latest/svg/supports-filter-lighting/actual-lighting.svg',
      'display: block; vertical-align: top; margin: 20px;'
    )
  );

  $container.appendChild(expectedText);
  $container.appendChild(
    createImage(
      '/act/test/monorepo/latest/svg/supports-filter-lighting/expected-lighting.png',
      'display: block; vertical-align: top; margin: 20px; width: 450px;'
    )
  );

  act.render($container, function () {
    act
      .ask(
        "Do each of the circles under 'Actual rendering' look like their corresponding circle under 'Expected rendering'? (For the second and fourth circle, this test should fail if they are plain green.)"
      )
      .send(function (answer) {
        answer ? act.success() : act.fail('Could not apply one or more SVG light filters');
      });
  });
}

loadSDK(runTest);
