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

function createImage(url) {
  var imgPromise = new Promise(function imgPromise(resolve, reject) {
    var $image = document.createElement('img');
    $image.addEventListener('load', function imgOnLoad() {
      resolve(this);
    });
    $image.addEventListener('error', function imgOnError() {
      reject(new Error('There was an error'));
    });
    $image.src = url;
  });
  return imgPromise;
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function runTest() {
  act.start();

  var $container = document.createElement('div');

  var styles = ['img { display: inline-block; width: 200px; margin: 5px; }'];
  injectStyle(styles);

  var $title1 = createTitle('.GIF Test');
  $container.appendChild($title1);

  var $p = createParagraph('There should be two images below');
  $container.appendChild($p);

  var $image1 = document.createElement('div');
  $image1.style.display = 'inline-block';
  $image1.style.verticalAlign = 'top';
  $image1.style.marginRight = '40px';

  var $p1 = createParagraph('Standard gif version of an iplayer image');

  $image1.appendChild($p1);
  $container.appendChild($image1);

  var $image2 = document.createElement('div');
  $image2.style.display = 'inline-block';
  $image2.style.verticalAlign = 'top';
  var $p2 = createParagraph('A donut that should be spinning');
  $p2.setAttribute('id', 'p2');
  $image2.appendChild($p2);
  $container.appendChild($image2);

  createImage('/act/test/monorepo/latest/html/img/supports-gif/iplayerImage.gif')
    .then(function fillfilled(image) {
      var $img1 = image;
      insertAfter($img1, $p1);
    })
    .catch(function rejected() {
      act.fail('The standard GIF image failed to load');
    });

  createImage('/act/test/monorepo/latest/html/img/supports-gif/donut.gif')
    .then(function fillfilled(image) {
      var $img2 = image;
      insertAfter($img2, $p2);
    })
    .catch(function rejected() {
      act.fail('The animated GIF image failed to load');
    });

  act.render($container, function () {
    act.ask('Do the gif images render and match the descriptions?').send(function (answer) {
      answer ? act.success() : act.fail('Images in GIF format are not supported.');
    });
  });
}

loadSDK(runTest);
