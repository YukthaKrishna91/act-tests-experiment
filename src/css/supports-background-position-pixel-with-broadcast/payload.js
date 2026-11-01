function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var TEST_MEDIA_WIDTH = '198px';

function createTest(args) {
  var testProps = args.testProps;
  var $testTitle = args.testTitle();
  var $testDescription = args.testDescription();
  var $expectedImage = args.expectedImage();

  var $test = document.createElement('div');
  $test.style.cssText =
    'display: table-cell; width: 50%; vertical-align: top; text-align: center;' +
    'padding: 0px; background-color: rgba(255,255,255,1);';

  var $box = createBox();
  $box.style.backgroundImage = testProps.backgroundImage;
  $box.style.backgroundRepeat = testProps.backgroundRepeat;
  $box.style.backgroundSize = testProps.backgroundSize;
  $box.style.backgroundPosition = testProps.backgroundPosition;
  $box.style.outline = testProps.outline;

  $testDescription.style.minHeight = '44px';
  $testDescription.style.margin = '0 0 8px';
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
    'width: ' + TEST_MEDIA_WIDTH + '; height: 132px; display: block; margin: 0 auto 12px;';
  return $box;
}

function createHeader(text) {
  var $title = document.createElement('h2');
  $title.style.cssText =
    'display: inline-block; margin: 0 0 8px; padding: 4px 10px;' +
    'background-color: rgba(255,255,255,0.22); color: white; font-size: 22px;' +
    'border: 1px solid rgba(255,255,255,0.3); border-radius: 10px;';
  $title.textContent = text;

  return $title;
}

function createParagraph(text) {
  var $paragraph = document.createElement('p');
  $paragraph.style.cssText =
    'display: block; margin: 0 0 8px; padding: 4px 8px;' +
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
    'color: rgb(24,24,24); font-size: 14px;';
  $label.textContent = text;
  return $label;
}

function createImage(path) {
  var $expectedImage = document.createElement('img');
  $expectedImage.src = path;
  $expectedImage.style.cssText =
    'display: block; margin: 0 auto; vertical-align: top; text-align: left;';
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
  $cell.style.paddingBottom = '80px';
  $cell.style.textAlign = 'center';

  var $stage = document.createElement('div');
  $stage.style.display = 'inline-block';
  $stage.style.width = '900px';
  $stage.style.maxWidth = '900px';
  $stage.style.padding = '16px 28px 18px';
  $stage.style.backgroundColor = 'rgba(7,15,24,0.34)';
  $stage.style.border = '1px solid rgba(255,255,255,0.22)';
  $stage.style.borderRadius = '18px';
  $stage.style.boxShadow = '0 18px 40px rgba(0,0,0,0.28)';
  $stage.style.textAlign = 'left';

  var $title = createHeader('Background Position Pixel Test');
  $stage.appendChild($title);

  var $intro = createParagraph(
    'Compare each red-outlined result with its expected image. The positioned background image should match the description in each case while the broadcast remains visible behind the stage.'
  );
  $stage.appendChild($intro);

  var $testsRow = document.createElement('div');
  $testsRow.style.display = 'table';
  $testsRow.style.tableLayout = 'fixed';
  $testsRow.style.width = '100%';
  $testsRow.style.borderSpacing = '12px 0';
  $testsRow.style.marginLeft = '-12px';
  $testsRow.style.marginRight = '-12px';

  $testsRow.appendChild(
    createTest({
      testProps: {
        backgroundImage:
          'url(/act/test/monorepo/latest/css/supports-background-position-pixel-with-broadcast/iplayer-image-small.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'auto',
        backgroundPosition: '5px 30px',
        outline: '3px solid red'
      },
      testTitle: createLabel.bind(null, 'Actual'),
      testDescription: createParagraph.bind(
        null,
        'Position: 5px from left, 30px from top — image should appear close to the left edge with more space above it'
      ),
      expectedImage: createImage.bind(
        null,
        '/act/test/monorepo/latest/css/supports-background-position-pixel-with-broadcast/5-30.png'
      )
    })
  );

  $testsRow.appendChild(
    createTest({
      testProps: {
        backgroundImage:
          'url(/act/test/monorepo/latest/css/supports-background-position-pixel-with-broadcast/iplayer-image-small.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'auto',
        backgroundPosition: '25px 25px',
        outline: '3px solid red'
      },
      testTitle: createLabel.bind(null, 'Actual'),
      testDescription: createParagraph.bind(
        null,
        'Position: 25px from left, 25px from top — image should appear with equal spacing from both the left edge and the top'
      ),
      expectedImage: createImage.bind(
        null,
        '/act/test/monorepo/latest/css/supports-background-position-pixel-with-broadcast/25-25.png'
      )
    })
  );

  $stage.appendChild($testsRow);
  $cell.appendChild($stage);

  $container.appendChild($cell);

  act.render($container, function () {
    act
      .ask(
        'Do the images below fit the descriptions and look like the expected results with broadcast background?'
      )
      .send(function (answer) {
        answer
          ? act.success()
          : act.fail('Background position did not look right when using a pixel value');
      });
  });
}

loadSDK(runTest);
