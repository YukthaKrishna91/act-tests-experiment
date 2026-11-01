function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createImage(image, filter) {
  var $image = document.createElement('img');
  var cssItems = ['display: inline-block; width: 175px; margin:15px; filter:', filter, ';'];
  $image.src = image;
  $image.style.cssText = cssItems.join('');
  return $image;
}

function createTitle(text) {
  var $title = document.createElement('h3');
  $title.style.cssText = 'display: block; margin:0; padding:0;';
  $title.textContent = text;

  return $title;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.height = '100%';
  var imageRef = '/act/test/monorepo/latest/css/supports-filter/iplayerImage.png';

  var $blurTitle = createTitle('Blur Filter');
  $container.appendChild($blurTitle);
  var $blurImage1 = createImage(
    '/act/test/monorepo/latest/css/supports-filter/refImageBlur.png',
    'none'
  );
  $container.appendChild($blurImage1);
  var $blurImage2 = createImage(imageRef, 'blur(3px)');
  $container.appendChild($blurImage2);

  var $grayscaleTitle = createTitle('Grayscale Filter');
  $container.appendChild($grayscaleTitle);
  var $greyscaleImage1 = createImage(
    '/act/test/monorepo/latest/css/supports-filter/refImageGrayscale.png',
    'none'
  );
  $container.appendChild($greyscaleImage1);
  var $greyscaleImage2 = createImage(imageRef, 'grayscale(1)');
  $container.appendChild($greyscaleImage2);

  var $multiTitle = createTitle('Multiple Filters');
  $container.appendChild($multiTitle);
  var $multiFilterImage1 = createImage(
    '/act/test/monorepo/latest/css/supports-filter/refImageMulti.png',
    'none'
  );
  $container.appendChild($multiFilterImage1);
  var $multiFilterImage2 = createImage(
    imageRef,
    'blur(3px) grayscale(1) drop-shadow(30px 10px 4px #4444dd);'
  );
  $container.appendChild($multiFilterImage2);

  act.render($container, function () {
    act
      .ask('Do the matching image pairs render identically (ignore minor size differences)?')
      .send(function (answer) {
        answer ? act.success() : act.fail('Filter is not supported');
      });
  });
}

loadSDK(runTest);
