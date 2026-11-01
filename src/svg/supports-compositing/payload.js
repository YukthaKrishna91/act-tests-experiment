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

function createMaskDefs() {
  var $defs = createSvgElement('defs', {});
  var $mask = createSvgElement('mask', { id: 'mask1' });
  var $linearGradient = createSvgElement('linearGradient', {
    id: 'grad',
    gradientUnits: 'objectBoundingBox',
    x2: '0',
    y2: '1'
  });
  var $stop1 = createSvgElement('stop', { 'stop-color': 'white', offset: '0' });
  var $stop2 = createSvgElement('stop', {
    'stop-color': 'black',
    'stop-opacity': '0',
    offset: '1'
  });
  var $circle = createSvgElement('circle', {
    cx: 100,
    cy: 100,
    r: 61,
    id: 'circle',
    fill: 'url(#grad)'
  });

  $linearGradient.appendChild($stop1);
  $linearGradient.appendChild($stop2);
  $mask.appendChild($linearGradient);
  $mask.appendChild($circle);
  $defs.appendChild($mask);

  return $defs;
}

function createTitle(text) {
  var $title = document.createElement('h2');
  $title.textContent = text;
  return $title;
}

function injectStyle(styles) {
  var $style = document.createElement('style');
  $style.innerHTML = styles.join('\n');
  document.body.appendChild($style);
}

function createImage(image) {
  var $image = document.createElement('img');
  $image.src = image;
  return $image;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.setAttribute('id', 'root-container');

  var styles = [
    '#root-container { background-color: white; color:black; position: relative;}',
    '.masked-element image { mask: url(#mask1);}',
    '.actual, .expected  { display: inline-block; width:200px;}',
    '.actual { margin-left: 20px; margin-bottom: 40px; }',
    '.actual h2 { font-size: 18px; }',
    '.expected h2 { font-size: 18px; }',
    '.expected { margin-left: 20px; margin-bottom: 40px; }',
    '.expected img { width:200px; }',
    'h2 { margin-bottom: 0; padding: 0; }'
  ];
  injectStyle(styles);

  var $title1 = createTitle('SVG Compositing');
  $container.appendChild($title1);

  var $actual = document.createElement('div');
  $actual.setAttribute('class', 'actual');
  var $actualTitle = createTitle('Actual');
  $actual.appendChild($actualTitle);

  var $svg = createSvgElement('svg', {
    id: 'svg-root',
    width: '200',
    height: '200',
    viewBox: '0 0 200 200',
    class: 'masked-element'
  });

  var $svgImage = createSvgElement('image', {
    href: '/act/test/monorepo/latest/svg/supports-compositing/iplayerImage.png',
    width: '200',
    height: '200'
  });

  var $mask = createMaskDefs();
  $svg.appendChild($mask);
  $svg.appendChild($svgImage);
  $actual.appendChild($svg);

  var $expected = document.createElement('div');
  $expected.setAttribute('class', 'expected');
  var $ExpectedTitle = createTitle('Expected');
  $expected.appendChild($ExpectedTitle);
  var $expectedImage = createImage(
    '/act/test/monorepo/latest/svg/supports-compositing/iplayerRefImage.png'
  );
  $expected.appendChild($expectedImage);

  $container.appendChild($actual);
  $container.appendChild($expected);

  act.render($container, function () {
    act
      .ask('Do the images look identical? (Ignoring minor position/size differences)')
      .send(function (answer) {
        answer ? act.success() : act.fail('SVG compositing is not fully supported.');
      });
  });
}

loadSDK(runTest);
