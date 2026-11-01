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
  var $testTitle = args.testTitle();
  var $testDescription = args.testDescription();
  var $expectedImage = args.expectedImage();

  var $test = document.createElement('div');
  $test.style.cssText = 'display: inline-block; width: 30%; text-align: left;';

  var $box = createBox();
  $box.style.backgroundImage = testProps.backgroundImage;
  $box.style.backgroundRepeat = testProps.backgroundRepeat;
  $box.style.backgroundSize = testProps.backgroundSize;
  $box.style.backgroundPosition = testProps.backgroundPosition;
  $box.style.outline = testProps.outline;

  $test.appendChild($testDescription);
  $test.appendChild($testTitle);
  $test.appendChild($box);
  $test.appendChild($expectedImage);
  return $test;
}

function createBox() {
  var $box = document.createElement('div');
  $box.style.cssText =
    'width: 198px; height: 132px; display: inline-block; vertical-align: top; margin: 20px;';
  return $box;
}

function createTitle(text) {
  var $title = document.createElement('h4');
  $title.style.cssText = 'display: block; padding:0; font-size: 16px; text-align: left;';
  $title.style.marginTop = '20px';
  $title.style.marginBottom = '-10px';
  $title.style.marginLeft = '20px';
  $title.style.color = 'black';
  $title.textContent = text;

  return $title;
}

function createImage(path) {
  var $expectedImage = document.createElement('img');
  $expectedImage.src = path;
  $expectedImage.style.cssText =
    'display: inline-block; margin: 20px; vertical-align: top; text-align: left;';
  return $expectedImage;
}

function runTest() {
  act.start();
  var $container = document.createElement('div');
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.height = '100%';

  var percent5050 = function () {
    return createTest({
      testProps: {
        backgroundImage:
          'url(/act/test/monorepo/latest/css/supports-background-position-percent/iplayer-image-small.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'auto',
        backgroundPosition: '50% 50%',
        outline: '3px solid red'
      },
      testTitle: createTitle.bind(null, 'Actual'),
      testDescription: createTitle.bind(
        null,
        '50%, 50%: Should be positioned in the center of the box'
      ),
      expectedImage: createImage.bind(
        null,
        '/act/test/monorepo/latest/css/supports-background-position-percent/50-50.png'
      )
    });
  };

  var percent2575 = function () {
    return createTest({
      testProps: {
        backgroundImage:
          'url(/act/test/monorepo/latest/css/supports-background-position-percent/iplayer-image-small.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'auto',
        backgroundPosition: '25% 75%',
        outline: '3px solid red'
      },
      testTitle: createTitle.bind(null, 'Actual'),
      testDescription: createTitle.bind(
        null,
        '25%, 75%: Should be positioned 25% across the x-axis, and 75% down the y-axis'
      ),
      expectedImage: createImage.bind(
        null,
        '/act/test/monorepo/latest/css/supports-background-position-percent/25-75.png'
      )
    });
  };

  [percent5050, percent2575].forEach(function (test) {
    $container.appendChild(test());
  });

  act.render($container, function () {
    act
      .ask('Do the images below fit the descriptions and look like the expected results?')
      .send(function (answer) {
        answer
          ? act.success()
          : act.fail('Background position did not look right when using a percentage value');
      });
  });
}

loadSDK(runTest);
