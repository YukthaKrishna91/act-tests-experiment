function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var TEST_MEDIA_WIDTH = '192px';

function createTest(args) {
  var testProps = args.testProps;
  var $testTitle = args.testTitle();
  var $testDescription = args.testDescription();
  var $expectedImage = args.expectedImage();

  var $test = document.createElement('div');
  $test.style.cssText =
    'display: table-cell; width: 50%; vertical-align: top; text-align: center;' +
    'padding: 0; background-color: rgba(255,255,255,1);' +
    'border: 1px solid rgba(255,255,255,0.18); border-radius: 14px;';

  var $box = createBox();
  $box.style.backgroundImage = testProps.backgroundImage;
  $box.style.backgroundRepeat = testProps.backgroundRepeat;
  $box.style.backgroundSize = testProps.backgroundSize;
  $box.style.backgroundColor = testProps.backgroundColor || 'transparent';
  $box.style.outline = testProps.outline;

  $testDescription.style.minHeight = '56px';
  $testDescription.style.marginBottom = '8px';
  $testDescription.style.textAlign = 'left';

  $test.appendChild($testDescription);
  $test.appendChild($testTitle);
  $test.appendChild($box);
  $test.appendChild($expectedImage);
  return $test;
}

function createBox() {
  var $box = document.createElement('div');
  $box.style.cssText =
    'width: ' + TEST_MEDIA_WIDTH + '; height: 150px; display: block; margin: 0 auto 18px;';
  return $box;
}

function createHeader(text) {
  var $title = document.createElement('h2');
  $title.style.cssText =
    'display: inline-block; margin: 0 0 12px; padding: 6px 10px;' +
    'background-color: rgba(255,255,255,0.22); color: white; font-size: 22px;' +
    'border: 1px solid rgba(255,255,255,0.3); border-radius: 10px;';
  $title.textContent = text;

  return $title;
}

function createParagraph(text) {
  var $paragraph = document.createElement('p');
  $paragraph.style.cssText =
    'display: block; margin: 0 0 10px; padding: 4px 8px;' +
    'background-color: rgba(255,255,255,0.92); color: rgb(24,24,24); font-size: 14px;' +
    'border-radius: 8px; border: 1px solid rgba(7,15,24,0.12);';
  $paragraph.textContent = text;
  return $paragraph;
}

function createLabel(text) {
  var $label = document.createElement('h4');
  $label.style.cssText =
    'display: block; width: ' +
    TEST_MEDIA_WIDTH +
    '; box-sizing: border-box; margin: 0 auto 2px; padding: 5px 9px; text-align: left;' +
    'color: rgb(24,24,24); font-size: 14px;' +
    'border-radius: 8px;';
  $label.textContent = text;
  return $label;
}

function createImage(path) {
  var $expectedImage = document.createElement('img');
  $expectedImage.src = path;
  $expectedImage.style.cssText =
    'width: 198px; height: 154px; display: block; margin: 0 auto; vertical-align: top';
  return $expectedImage;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.backgroundColor = 'transparent';
  $container.style.color = 'black';
  $container.style.width = '100%';
  $container.style.height = '100%';
  $container.style.display = 'table';

  var $cell = document.createElement('div');
  $cell.style.display = 'table-cell';
  $cell.style.verticalAlign = 'top';
  $cell.style.paddingTop = '4px';
  $cell.style.paddingBottom = '120px';
  $cell.style.textAlign = 'center';

  var $stage = document.createElement('div');
  $stage.style.display = 'inline-block';
  $stage.style.width = '900px';
  $stage.style.maxWidth = '900px';
  $stage.style.padding = '22px 28px 24px';
  $stage.style.backgroundColor = 'rgba(7,15,24,0.34)';
  $stage.style.border = '1px solid rgba(255,255,255,0.22)';
  $stage.style.borderRadius = '18px';
  $stage.style.boxShadow = '0 18px 40px rgba(0,0,0,0.28)';
  $stage.style.textAlign = 'left';

  var $title = createHeader('Background Size Test');
  $stage.appendChild($title);

  var $intro = createParagraph(
    'Compare each red-outlined result with its expected image. The pixel-sized example should leave a gap at the bottom, while the percentage-sized example should stretch to fill the box.'
  );
  $stage.appendChild($intro);

  var $testsRow = document.createElement('div');
  $testsRow.style.display = 'table';
  $testsRow.style.tableLayout = 'fixed';
  $testsRow.style.width = '100%';
  $testsRow.style.borderSpacing = '12px 0';
  $testsRow.style.marginLeft = '-12px';
  $testsRow.style.marginRight = '-12px';

  var $pixelTest = createTest({
    testProps: {
      backgroundImage:
        'url(/act/test/monorepo/latest/css/supports-background-size-1-with-broadcast/iplayerimage.png)',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '192px 128px',
      backgroundColor: 'white',
      outline: '3px solid red'
    },
    testTitle: createLabel.bind(null, 'Actual'),
    testDescription: createParagraph.bind(
      null,
      'Pixel size (192px x 128px): image should leave a visible gap at the bottom because it is shorter than the box'
    ),
    expectedImage: createImage.bind(
      null,
      '/act/test/monorepo/latest/css/supports-background-size-1-with-broadcast/expected-pixels.png'
    )
  });
  $testsRow.appendChild($pixelTest);

  var $percentTest = createTest({
    testProps: {
      backgroundImage:
        'url(/act/test/monorepo/latest/css/supports-background-size-1-with-broadcast/iplayerimage.png)',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      outline: '3px solid red'
    },
    testTitle: createLabel.bind(null, 'Actual'),
    testDescription: createParagraph.bind(
      null,
      'Percentage size (100% x 100%): image should stretch to fill the whole box, even if it looks distorted'
    ),
    expectedImage: createImage.bind(
      null,
      '/act/test/monorepo/latest/css/supports-background-size-1-with-broadcast/expected-percent.png'
    )
  });
  $testsRow.appendChild($percentTest);

  $stage.appendChild($testsRow);
  $cell.appendChild($stage);

  $container.appendChild($cell);

  act.render($container, function () {
    act
      .ask(
        'Do the images below match the descriptions and expected results with broadcast background?'
      )
      .send(function (answer) {
        answer
          ? act.success()
          : act.fail('Background size is not supported using pixels or percent.');
      });
  });
}

loadSDK(runTest);
