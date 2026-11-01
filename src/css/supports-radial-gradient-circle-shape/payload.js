function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createGradientTest($container, props) {
  $container.appendChild(createTitle('Actual'));
  var $actual = document.createElement('div');
  $actual.style.cssText =
    'height: 160px; width: 760px; margin: 5px; background-image: ' + props.gradient + ';';
  $container.appendChild($actual);
  $container.appendChild(createTitle('Expected'));
  var $expected = document.createElement('div');
  $expected.appendChild(props.expectedImage());
  $container.appendChild($expected);

  return {
    description: props.description,
    failMessage: props.failMessage
  };
}

function createTitle(text) {
  var $title = document.createElement('h3');
  $title.style.cssText = 'display: inline-block; margin-left: 10; padding:0; font-size: 18px;';
  $title.textContent = text;

  return $title;
}

function createImage(path) {
  var $expectedImage = document.createElement('img');
  $expectedImage.src = path;
  $expectedImage.style.cssText = 'display: inline-block; margin: 5px; vertical-align: top;';
  return $expectedImage;
}

loadSDK(() => {
  var $container = document.createElement('div');
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.height = '100%';

  var test = createGradientTest($container, {
    gradient: 'radial-gradient(circle, red, yellow, green);',
    description:
      'Should show a red-yellow-green gradient radiating outwards from a central circle shape with evenly spaced colors (should match the expected image, ignoring size differences and outlines should be solid).',
    failMessage:
      'Could not render radial gradient using three color stops with the shape set to "circle".',
    expectedImage: function () {
      return createImage(
        '/act/test/monorepo/latest/css/supports-radial-gradient-circle-shape/expected.png'
      );
    }
  });

  act.render($container, function () {
    act.ask(test.description).send(function (answer) {
      answer ? act.success() : act.fail(test.failMessage);
    });
  });
});
