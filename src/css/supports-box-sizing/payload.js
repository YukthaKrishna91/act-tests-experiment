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

  var $testContainer = document.createElement('div');
  $testContainer.style.cssText = 'display: block;';

  var $test = document.createElement('div');
  $test.style.width = '300px';
  $test.style.height = '100px';
  $test.style.backgroundColor = '#f5f5f5';
  $test.style.border = '5px solid #0000ff';

  var $box = createChildBox();
  $box.style.boxSizing = testProps.boxSizing;
  $box.textContent = testProps.textContent;

  $testContainer.appendChild($testDescription);
  $testContainer.appendChild($test);
  $test.appendChild($box);
  $testContainer.appendChild($expectedImage);
  return $testContainer;
}

function createChildBox() {
  var $box = document.createElement('div');
  $box.style.border = '5px solid #f7b239';
  $box.style.padding = '5px';
  $box.style.width = '100%';
  $box.style.height = '30px';

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
      boxSizing: 'content-box',
      textContent: 'content-box: actual'
    },
    $testDescription: createTitle('The orange box should stick out of the blue box.'),
    $expectedImage: createImage('')
  });
  $container.appendChild($contentBoxTest);

  var $borderBoxTest = createTest({
    testProps: {
      boxSizing: 'border-box',
      textContent: 'border-box: actual'
    },
    $testDescription: createTitle('The orange box should sit within the blue box.'),
    $expectedImage: createImage('')
  });
  $container.appendChild($borderBoxTest);

  act.render($container, function () {
    act.ask('Do the images below fit their descriptions?').send(function (answer) {
      answer ? act.success() : act.fail('box-sizing does not work correctly');
    });
  });
}

loadSDK(runTest);
