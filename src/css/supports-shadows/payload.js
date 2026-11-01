function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createTitle(text) {
  var $title = document.createElement('h2');
  $title.textContent = text;
  return $title;
}

function injectStyle(styles) {
  var $style = document.createElement('style');
  $style.innerHTML = styles.join('\n');
  document.body.appendChild($style);
}

function createItem() {
  var $item = document.createElement('div');
  $item.classList.add('item');
  return $item;
}

function createImage(image) {
  var $image = document.createElement('img');
  $image.src = image;
  return $image;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.height = '100%';

  var styles = [
    'h2 { margin:20px 0 0 25px; padding:0; font-size: 30px; text-shadow: #666 2px 0 5px;}',
    '.item {width: 150px; height: 150px; display: block; margin: 40px 0 0 25px; background-color: rgb(0, 100, 100); box-shadow: 10px 10px 8px #888888;}',
    'img { width: 200px; margin: 40px 0 0 25px; filter: drop-shadow(16px 16px 10px black) }'
  ];
  injectStyle(styles);

  var $title1 = createTitle('This text should have a gray text shadow');
  $container.appendChild($title1);

  var $item1 = createItem();
  $container.appendChild($item1);

  var $image1 = createImage('/act/test/monorepo/latest/css/supports-shadows/iplayerImage.png');
  $container.appendChild($image1);

  act.render($container, function () {
    act.ask('Can you see shadows on the text, the box and the image?').send(function (answer) {
      answer ? act.success() : act.fail('Shadows are not supported.');
    });
  });
}

loadSDK(runTest);
