function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createSvgElement(type, config) {
  var $svg = document.createElementNS('http://www.w3.org/2000/svg', type);
  for (var key in config) {
    $svg.setAttribute(key, config[key]);
  }
  return $svg;
}

function createFillTest($container, props) {
  var $actual = document.createElement('div');
  $actual.style.display = 'inline-block';
  var $actualTitle = createTitle('Actual');
  var $svg = createSvgElement('svg', {
    viewBox: '-20 -50 150 150',
    width: '200',
    height: '200'
  });
  var config = {
    points: '50,0 21,90 98,35 2,35 79,90'
  };
  config[props.fillProp] = props.fillValue;
  var $polygon = createSvgElement('polygon', config);

  $actual.appendChild($actualTitle);
  $actual.appendChild($svg);
  $container.appendChild($actual);
  $svg.appendChild($polygon);
  var $expected = document.createElement('div');
  $expected.style.display = 'inline-block';
  var $expectedTitle = createTitle('Expected');
  $expected.appendChild($expectedTitle);
  $expected.appendChild(props.expectedImage());
  $container.appendChild($expected);

  return {
    description: props.description,
    failMessage: props.failMessage
  };
}

function createTitle(text) {
  var $title = document.createElement('h3');
  $title.style.cssText = 'display: inline-block; margin-left: 20px; padding:0; font-size: 18px;';
  $title.textContent = text;

  return $title;
}

function createImage(path) {
  var $expectedImage = document.createElement('img');
  $expectedImage.src = path;
  $expectedImage.style.marginBottom = '-15px';
  return $expectedImage;
}

var $container = document.createElement('div');
$container.style.backgroundColor = 'white';
$container.style.color = 'black';
$container.style.height = '100%';

var test = createFillTest($container, {
  fillProp: 'fill-rule',
  fillValue: 'evenodd',
  description:
    'Should show a star where the points are black but the middle is white and match the expected image',
  failMessage: 'Does not support the fill-rule property for SVGs.',
  expectedImage: function () {
    return createImage('/act/test/monorepo/latest/svg/supports-fill-rule/expected.png');
  }
});

loadSDK(() => {
  act.render($container, function () {
    act.ask(test.description).send(function (answer) {
      answer ? act.success() : act.fail(test.failMessage);
    });
  });
});
