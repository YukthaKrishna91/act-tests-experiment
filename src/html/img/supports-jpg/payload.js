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

function createParagraph(text) {
  var $paragraph = document.createElement('p');
  $paragraph.textContent = text;
  return $paragraph;
}

function createImage(image) {
  var $image = document.createElement('img');
  $image.src = image;
  return $image;
}

function runTest() {
  act.start();
  var $container = document.createElement('div');

  var styles = ['img { display: inline-block; width: 200px; margin: 5px; }'];
  injectStyle(styles);

  var $title1 = createTitle('.JPG Test');
  $container.appendChild($title1);

  var $p1 = createParagraph('Standard jpg version of an iplayer image');
  $container.appendChild($p1);

  var $img1 = createImage('/act/test/monorepo/latest/html/img/supports-jpg/iplayerImage.jpg');
  $container.appendChild($img1);

  act.render($container, function () {
    act.ask('Does the jpg image render?').send(function (answer) {
      answer ? act.success() : act.fail('Images in JPG format are not supported.');
    });
  });
}

loadSDK(runTest);
