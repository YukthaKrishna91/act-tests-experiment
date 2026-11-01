function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createTest(args) {
  var testProps = args.testProps;
  var $testTitle = args.$testTitle;
  var $testDescription = args.$testDescription;
  var $expectedImage = args.$expectedImage;

  var $test = document.createElement('div');
  $test.style.cssText = 'display: block;';

  var $box = createBox();
  $box.style.backgroundImage = testProps.backgroundImage;
  $box.style.backgroundRepeat = testProps.backgroundRepeat;
  $box.style.backgroundSize = testProps.backgroundSize;
  $box.style.outline = testProps.outline;
  $box.appendChild($testTitle);

  $test.appendChild($testDescription);
  $test.appendChild($box);
  $test.appendChild($expectedImage);
  return $test;
}

function createBox() {
  var $box = document.createElement('div');
  $box.style.cssText =
    'width: 192px; height: 150px; display: inline-block; vertical-align: top; margin: 10px;';
  return $box;
}

function createTitle(text, color) {
  var $title = document.createElement('h4');
  $title.style.cssText = 'display: block; margin:10px; padding:0; font-size: 16px;';
  $title.style.color = color;
  $title.textContent = text;

  return $title;
}

function createImage(path) {
  var $expectedImage = document.createElement('img');
  $expectedImage.src = path;
  $expectedImage.style.cssText =
    'width: 192px; height: 150px; display: inline-block; margin: 10px; vertical-align: top';
  return $expectedImage;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.height = '100%';

  var $pixelTest = createTest({
    testProps: {
      backgroundImage:
        'url(/act/test/monorepo/latest/css/supports-background-size-1/iplayerimage.png)',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '192px 128px',
      outline: '3px solid red'
    },
    $testTitle: createTitle('pixels: actual', 'white'),
    $testDescription: createTitle(
      'Should leave a white gap at the bottom as the pixel height is set to less than the height of the box',
      'black'
    ),
    $expectedImage: createImage(
      '/act/test/monorepo/latest/css/supports-background-size-1/expected-pixels.png'
    )
  });
  $container.appendChild($pixelTest);

  var $percentTest = createTest({
    testProps: {
      backgroundImage:
        'url(/act/test/monorepo/latest/css/supports-background-size-1/iplayerimage.png)',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      outline: '3px solid red'
    },
    $testTitle: createTitle('percent: actual', 'white'),
    $testDescription: createTitle(
      'Should fill all the space in the box even if the image looks distorted as the aspect ratio is lost',
      'black'
    ),
    $expectedImage: createImage(
      '/act/test/monorepo/latest/css/supports-background-size-1/expected-percent.png'
    )
  });
  $container.appendChild($percentTest);

  act.render($container, function () {
    act
      .ask('Do the images below fit their descriptions and look like their expected result?')
      .send(function (answer) {
        answer
          ? act.success()
          : act.fail('Background size is not supported using pixels or percent.');
      });
  });
}

loadSDK(runTest);
