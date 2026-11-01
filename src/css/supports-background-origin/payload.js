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
  var $testDescription = args.$testDescription;
  var $expectedImage = args.$expectedImage;

  var $test = document.createElement('div');
  $test.style.cssText = 'display: block;';

  var $box = createBox();
  $box.style.backgroundOrigin = testProps.backgroundOrigin;
  $box.textContent = testProps.textContent;
  $box.style.fontSize = '16px';
  $box.style.textAlign = 'left';

  $test.appendChild($testDescription);
  $test.appendChild($box);
  $test.appendChild($expectedImage);
  return $test;
}

function createBox() {
  var $box = document.createElement('div');
  $box.style.border = '5px dashed #0000ff';
  $box.style.width = '300px';
  $box.style.height = '50px';
  $box.style.padding = '15px';
  $box.style.margin = '10px';
  $box.style.backgroundImage =
    'url(/act/test/monorepo/latest/css/supports-background-origin/iplayerimage.png)';
  $box.style.backgroundRepeat = 'no-repeat';
  $box.style.display = 'inline-block';
  $box.style.color = '#fafafa';
  $box.style.verticalAlign = 'top';
  return $box;
}

function createTitle(text, color) {
  var $title = document.createElement('h4');
  $title.style.cssText = 'display: block; margin: 10px; padding:0; font-size: 16px;';
  $title.style.color = color;
  $title.textContent = text;

  return $title;
}

function createImage(path) {
  var $expectedImage = document.createElement('img');
  $expectedImage.src = path;
  $expectedImage.style.cssText = 'display: inline-block; vertical-align: top; margin: 10px;';
  return $expectedImage;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.height = '100%';

  var $contentBoxTest = createTest({
    testProps: {
      backgroundOrigin: 'content-box',
      textContent: 'content-box: actual'
    },
    $testDescription: createTitle(
      'The background image should start within the content area, showing a visible gap between the upper left corner of the border.'
    ),
    $expectedImage: createImage(
      '/act/test/monorepo/latest/css/supports-background-origin/expected-content-box.png'
    )
  });
  $container.appendChild($contentBoxTest);

  var $paddingBoxTest = createTest({
    testProps: {
      backgroundOrigin: 'padding-box',
      textContent: 'padding-box: actual'
    },
    $testDescription: createTitle(
      'The background image should start from where the padding begins, just touching the inner edge of the blue border'
    ),
    $expectedImage: createImage(
      '/act/test/monorepo/latest/css/supports-background-origin/expected-padding-box.png'
    )
  });
  $container.appendChild($paddingBoxTest);

  var $borderBoxTest = createTest({
    testProps: {
      backgroundOrigin: 'border-box',
      textContent: 'border-box: actual'
    },
    $testDescription: createTitle(
      'The background image should start from the outer edge of the blue border, such that you can see the image behind the border.'
    ),
    $expectedImage: createImage(
      '/act/test/monorepo/latest/css/supports-background-origin/expected-border-box.png'
    )
  });
  $container.appendChild($borderBoxTest);

  act.render($container, function () {
    act
      .ask('Do all 3 images below fit their descriptions and look like their expected result?')
      .send(function (answer) {
        answer ? act.success() : act.fail('Background origin is not supported');
      });
  });
}

loadSDK(runTest);
