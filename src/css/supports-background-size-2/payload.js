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

  var $coverTest = createTest({
    testProps: {
      backgroundImage:
        'url(/act/test/monorepo/latest/css/supports-background-size-2/iplayerimage.png)',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      outline: '3px solid red'
    },
    $testTitle: createTitle('cover: actual', 'white'),
    $testDescription: createTitle(
      "Should appear 'zoomed in' as the image fills all the space in the box without being constrained by it",
      'black'
    ),
    $expectedImage: createImage(
      '/act/test/monorepo/latest/css/supports-background-size-2/expected-cover.png'
    )
  });
  $container.appendChild($coverTest);

  var $containTest = createTest({
    testProps: {
      backgroundImage:
        'url(/act/test/monorepo/latest/css/supports-background-size-2/iplayerimage.png)',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      outline: '3px solid red'
    },
    $testTitle: createTitle('contain: actual', 'white'),
    $testDescription: createTitle(
      'Should leave a white gap at the bottom as the image is resized to fit in the box while preserving its aspect ratio',
      'black'
    ),
    $expectedImage: createImage(
      '/act/test/monorepo/latest/css/supports-background-size-2/expected-contain.png'
    )
  });
  $container.appendChild($containTest);

  act.render($container, function () {
    act
      .ask('Do the images below fit their descriptions and look like their expected result?')
      .send(function (answer) {
        answer
          ? act.success()
          : act.fail('Background size is not supported using cover or contain.');
      });
  });
}

loadSDK(runTest);
