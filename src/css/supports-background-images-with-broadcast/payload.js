function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createBox() {
  var $box = document.createElement('div');
  $box.style.cssText =
    'width: 300px; height: 200px; display: inline-block; margin: 20px; vertical-align: top; background-repeat: no-repeat;';
  return $box;
}

function createImage(image) {
  var $image = document.createElement('img');
  $image.src = image;
  $image.style.cssText =
    'display: inline-block; width: 300px; height: 200px; margin: 20px; vertical-align: top;';
  return $image;
}

function createSection(label, $content) {
  var $section = document.createElement('div');
  var $label = document.createElement('h3');
  $section.style.cssText =
    'display: inline-block; position: relative; vertical-align: top; margin: 20px; text-align: left;';
  $label.textContent = label;
  $label.style.cssText =
    'position: absolute; top: -20px; left: 20px; z-index: 1; margin: 0; padding: 4px 10px; font-weight: bold; color: #fff; background: rgba(0, 0, 0, 0.7); border-radius: 4px;';
  $section.appendChild($label);
  $section.appendChild($content);
  return $section;
}

function createComparison() {
  var $comparison = document.createElement('div');
  $comparison.style.cssText = 'display: inline-block;';

  var $box = createBox();
  $box.style.backgroundImage =
    'url(/act/test/monorepo/latest/css/supports-background-images-with-broadcast/red.png), url(/act/test/monorepo/latest/css/supports-background-images-with-broadcast/blue.png), url(/act/test/monorepo/latest/css/supports-background-images-with-broadcast/green.png)';

  $comparison.appendChild(createSection('Actual', $box));
  $comparison.appendChild(
    createSection(
      'Expected',
      createImage(
        '/act/test/monorepo/latest/css/supports-background-images-with-broadcast/expected.png'
      )
    )
  );

  return $comparison;
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
  $cell.style.verticalAlign = 'middle';
  $cell.style.textAlign = 'center';

  $cell.appendChild(createComparison());
  $container.appendChild($cell);

  act.render($container, function () {
    act
      .ask(
        'Do you see two matching images with the colours red, blue, green with broadcast background?'
      )
      .send(function (answer) {
        answer ? act.success() : act.fail('Unable to render layered background images correctly.');
      });
  });
}

loadSDK(runTest);
