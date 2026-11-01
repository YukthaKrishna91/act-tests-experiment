function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

const HEIGHT_720 = 720;
const WIDTH_720 = 1280;
const HEIGHT_1080 = 1080;
const WIDTH_1080 = 1920;

const scheme = {
  boundaryLineColor: 'red',
  innerLineColor: 'yellow',
  outerLineColor: 'green',
  backgroundColor: 'black'
};

function createOuterBox(width, height) {
  var $box = document.createElement('div');
  $box.id = 'outer-box';
  $box.style.position = 'absolute';
  $box.style.left = '0';
  $box.style.top = '0';
  $box.style.outline = `${scheme.outerLineColor} solid 5px`;
  $box.style.backgroundColor = scheme.backgroundColor;
  $box.style.height = `${height}px`;
  $box.style.width = `${width}px`;
  return $box;
}

function createBoundaryBox(width, height) {
  var weight = 5;
  var $box = document.createElement('div');
  $box.id = 'boundary-box';
  $box.style.position = 'absolute';
  $box.style.left = `${weight}px`;
  $box.style.top = `${weight}px`;
  $box.style.outline = `${scheme.boundaryLineColor} solid ${weight}px`;
  $box.style.backgroundColor = scheme.backgroundColor;
  $box.style.height = `${height - weight * 2}px`;
  $box.style.width = `${width - weight * 2}px`;
  var $text = createText(height);
  $box.appendChild($text);
  return $box;
}

function createInnerBox(width, height) {
  var weight = 7;
  var $box = document.createElement('div');
  $box.id = 'inner-box';
  $box.style.position = 'absolute';
  $box.style.left = `${weight + 1}px`;
  $box.style.top = `${weight + 1}px`;
  $box.style.outline = `${scheme.innerLineColor} solid ${weight}px`;
  $box.style.backgroundColor = scheme.backgroundColor;
  $box.style.height = `${height - weight * 2 - 2}px`;
  $box.style.width = `${width - weight * 2 - 2}px`;
  var $text = createText(height);
  $box.appendChild($text);
  return $box;
}

function createText(innerText) {
  var $p = document.createElement('p');
  $p.innerText = innerText;
  $p.style.position = 'absolute';
  $p.style.fontSize = '50px';
  $p.style.color = 'white';
  $p.style.left = '50%';
  $p.style.top = '45%';
  return $p;
}

function askForResponse(height, $container) {
  act.render($container, function () {
    act
      .ask(
        `Can you see a ${scheme.boundaryLineColor} line on the edge of the viewport on the outer edge of the ${scheme.innerLineColor} line and no green line is visible?`
      )
      .addButton('Yes', true, 'primary')
      .addButton('No', false, 'warning')
      .send(function (response) {
        return response ? act.success() : act.fail();
      });
  });
}

function runTest() {
  act.start();

  // First check innerWidth and innerHeight
  const width = window.innerWidth;
  const height = window.innerHeight;

  const correct720 = width === WIDTH_720 && height === HEIGHT_720;
  const correct1080 = width === WIDTH_1080 && height === HEIGHT_1080;

  if (!correct720 && !correct1080) {
    return act.fail(`${height}x${width} is not a valid BBC viewport size`);
  }

  // Then check CSS height and width
  document.body.style.overflow = 'hidden';

  var $container = document.createElement('div');

  if (correct1080) {
    var $1080Box = createOuterBox(WIDTH_1080, HEIGHT_1080);
    var $1080boundaryBox = createBoundaryBox(WIDTH_1080, HEIGHT_1080);
    var $1080innerBox = createInnerBox(WIDTH_1080, HEIGHT_1080);
    $container.appendChild($1080Box);
    $container.appendChild($1080boundaryBox);
    $container.appendChild($1080innerBox);
    askForResponse(HEIGHT_1080, $container);
  }

  if (correct720) {
    var $720Box = createOuterBox(WIDTH_720, HEIGHT_720);
    var $720boundaryBox = createBoundaryBox(WIDTH_720, HEIGHT_720);
    var $720innerBox = createInnerBox(WIDTH_720, HEIGHT_720);
    $container.appendChild($720Box);
    $container.appendChild($720boundaryBox);
    $container.appendChild($720innerBox);
    askForResponse(HEIGHT_720, $container);
  }
}

loadSDK(runTest);
