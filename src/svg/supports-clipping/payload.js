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

function createSvgElement(type, config) {
  var $svg = document.createElementNS('http://www.w3.org/2000/svg', type);
  for (var key in config) {
    $svg.setAttribute(key, config[key]);
  }
  return $svg;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.setAttribute('id', 'root-container');

  var styles = [
    '#root-container { background-color: white; color:black; position: relative;}',
    '.clipped-element image { mask: url(#mask1);}',
    '.actual, .expected  { display: inline-block; width:400px; vertical-align: top;}',
    '.actual { margin-left: 20px; }',
    '.expected { margin-left: 20px;}',
    '.expected img { width:300px; margin-top: -8px;}'
  ];
  injectStyle(styles);

  var $title1 = createTitle('SVG Clipping');
  $container.appendChild($title1);

  var $actual = document.createElement('div');
  $actual.setAttribute('class', 'actual');
  var $actualTitle = createTitle('Actual');
  $actual.appendChild($actualTitle);

  var $svg = createSvgElement('svg', {
    id: 'svg-root',
    width: '400',
    height: '200',
    viewBox: '0 0 400 200',
    class: 'clipped-element'
  });

  var $defs = createSvgElement('defs', {});
  var $clipPath = createSvgElement('clipPath', { id: 'cut-off-bottom' });
  var $rect = createSvgElement('rect', { x: '25', y: '25', width: '250', height: '75' });

  var $circle = createSvgElement('circle', {
    cx: 150,
    cy: 150,
    r: 125,
    'clip-path': 'url(#cut-off-bottom)'
  });

  $clipPath.appendChild($rect);
  $defs.appendChild($clipPath);
  $svg.appendChild($circle);
  $svg.appendChild($defs);
  $actual.appendChild($svg);

  var $expected = document.createElement('div');
  $expected.setAttribute('class', 'expected');
  var $ExpectedTitle = createTitle('Expected');
  $expected.appendChild($ExpectedTitle);
  var $expectedImage = createImage(
    '/act/test/monorepo/latest/svg/supports-clipping/svgClippingRef.png'
  );
  $expected.appendChild($expectedImage);

  $container.appendChild($actual);
  $container.appendChild($expected);

  act.render($container, function () {
    act
      .ask('Do the images look identical? (Ignoring minor position/size differences)')
      .send(function (answer) {
        answer ? act.success() : act.fail('SVG clipping is not fully supported.');
      });
  });
}

loadSDK(runTest);
