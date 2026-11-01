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
    '.actual, .expected  { display: inline-block; width:400px; font-size: 16px;}',
    '.actual { margin-left: 20px;}',
    '.expected { margin-left: 20px; }',
    '.expected img { width: 330px; }'
  ];
  injectStyle(styles);

  var $title1 = createTitle('SVG Stroke');
  $container.appendChild($title1);

  var $actual = document.createElement('div');
  $actual.setAttribute('class', 'actual');
  var $actualTitle = createTitle('Actual');
  $actual.appendChild($actualTitle);

  var $svg = createSvgElement('svg', {
    id: 'svg-root',
    width: '400',
    height: '400',
    viewBox: '0 0 400 400'
  });

  var $rect = createSvgElement('rect', {
    x: '20',
    y: '20',
    width: '100',
    height: '100',
    fill: 'none',
    stroke: 'purple',
    'stroke-width': '20'
  });

  var $lineButt = createSvgElement('line', {
    x1: '20',
    x2: '20',
    y1: '150',
    y2: '200',
    stroke: 'green',
    'stroke-width': '20',
    'stroke-linecap': 'butt'
  });
  var $lineSquare = createSvgElement('line', {
    x1: '70',
    x2: '70',
    y1: '150',
    y2: '200',
    stroke: 'red',
    'stroke-width': '20',
    'stroke-linecap': 'square'
  });
  var $lineRound = createSvgElement('line', {
    x1: '120',
    x2: '120',
    y1: '150',
    y2: '200',
    stroke: 'blue',
    'stroke-width': '20',
    'stroke-linecap': 'round'
  });

  var $polylineMitre = createSvgElement('polyline', {
    points: '200 60 240 20 280 60',
    stroke: 'green',
    'stroke-width': '20',
    'stroke-linecap': 'butt',
    fill: 'none',
    'stroke-linejoin': 'miter'
  });
  var $polylineRound = createSvgElement('polyline', {
    points: '200 120 240 80 280 120',
    stroke: 'red',
    'stroke-width': '20',
    'stroke-linecap': 'butt',
    fill: 'none',
    'stroke-linejoin': 'round'
  });
  var $polylineBevel = createSvgElement('polyline', {
    points: '200 180 240 140 280 180',
    stroke: 'blue',
    'stroke-width': '20',
    'stroke-linecap': 'butt',
    fill: 'none',
    'stroke-linejoin': 'bevel'
  });

  var $straightPath = createSvgElement('path', {
    d: 'M 20 300 L 260 300',
    stroke: 'red',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-dasharray': '5,5',
    fill: 'none'
  });
  var $curvedPath = createSvgElement('path', {
    d: 'M 20 300 Q 60 200 140 300 T 260 300',
    stroke: 'black',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-dasharray': '5,10,5',
    fill: 'none'
  });

  $svg.appendChild($rect);
  $svg.appendChild($lineButt);
  $svg.appendChild($lineSquare);
  $svg.appendChild($lineRound);
  $svg.appendChild($polylineMitre);
  $svg.appendChild($polylineRound);
  $svg.appendChild($polylineBevel);
  $svg.appendChild($straightPath);
  $svg.appendChild($curvedPath);
  $actual.appendChild($svg);

  var $expected = document.createElement('div');
  $expected.setAttribute('class', 'expected');
  var $ExpectedTitle = createTitle('Expected');
  $expected.appendChild($ExpectedTitle);
  var $expectedImage = createImage('/act/test/monorepo/latest/svg/supports-stroke/strokeRef.png');
  $expected.appendChild($expectedImage);

  $container.appendChild($actual);
  $container.appendChild($expected);

  act.render($container, function () {
    act
      .ask('Do the images look identical? (Ignoring minor position/size differences)')
      .send(function (answer) {
        answer ? act.success() : act.fail('SVG stroke is not fully supported.');
      });
  });
}

loadSDK(runTest);
