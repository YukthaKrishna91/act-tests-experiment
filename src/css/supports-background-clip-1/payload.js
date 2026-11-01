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
  $box.style.backgroundClip = testProps.backgroundClip;
  $box.appendChild($testTitle);

  $test.appendChild($testDescription);
  $test.appendChild($box);
  $test.appendChild($expectedImage);
  return $test;
}

function createBox() {
  var $box = document.createElement('div');
  $box.style.border = '5px dashed #0000ff';
  $box.style.width = '250px';
  $box.style.height = '50px';
  $box.style.padding = '15px';
  $box.style.margin = '10px';
  $box.style.backgroundImage =
    'url(/act/test/monorepo/latest/css/supports-background-clip-1/iplayerimage.png)';
  $box.style.display = 'inline-block';
  $box.style.backgroundPosition = 'center';
  $box.style.verticalAlign = 'top';

  return $box;
}

function createTitle(text) {
  var $title = document.createElement('h3');
  $title.style.cssText = 'display: block; margin:10px; padding:0;';
  $title.style.backgroundColor = 'white';
  $title.textContent = text;
  $title.style.display = 'inline-block';
  $title.style.fontSize = '15px';
  $title.style.fontWeight = 'bold';
  $title.style.color = 'black';

  return $title;
}

function createDescription(text) {
  var $description = document.createElement('h3');
  $description.style.cssText = 'display: block; margin:10px; padding:0;';
  $description.textContent = text;

  return $description;
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
      backgroundClip: 'content-box'
    },
    $testTitle: createTitle('content-box: actual'),
    $testDescription: createDescription(
      'The background image should start within the content area, showing a visible gap between the image and the inner edge of the blue border.'
    ),
    $expectedImage: createImage(
      '/act/test/monorepo/latest/css/supports-background-clip-1/expected-content-box.png'
    )
  });
  $container.appendChild($contentBoxTest);

  var $paddingBoxTest = createTest({
    testProps: {
      backgroundClip: 'padding-box'
    },
    $testTitle: createTitle('padding-box: actual'),
    $testDescription: createDescription(
      'The background image should start where the padding starts, just touching the inner edge of the blue border.'
    ),
    $expectedImage: createImage(
      '/act/test/monorepo/latest/css/supports-background-clip-1/expected-padding-box.png'
    )
  });
  $container.appendChild($paddingBoxTest);

  act.render($container, function () {
    act
      .ask('Do the images below fit their descriptions and look like their expected result?')
      .send(function (answer) {
        answer
          ? act.success()
          : act.fail('background-clip does not work correctly using padding-box or content-box');
      });
  });
}

loadSDK(runTest);
