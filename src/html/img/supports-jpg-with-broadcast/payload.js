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
  $title.style.cssText =
    'display: inline-block; margin: 0 0 12px; padding: 6px 10px;' +
    'background-color: rgba(255,255,255,0.22); color: white; font-size: 22px;' +
    'border: 1px solid rgba(255,255,255,0.3); border-radius: 10px;';
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
  $paragraph.style.cssText =
    'display: block; margin: 0 0 10px; padding: 4px 8px;' +
    'background-color: rgba(255,255,255,0.92); color: rgb(24,24,24); font-size: 14px;' +
    'border-radius: 8px; border: 1px solid rgba(7,15,24,0.12);';
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
  $container.style.backgroundColor = 'transparent';
  $container.style.width = '100%';
  $container.style.height = '100%';
  $container.style.display = 'table';

  var $cell = document.createElement('div');
  $cell.style.display = 'table-cell';
  $cell.style.verticalAlign = 'top';
  $cell.style.paddingTop = '20px';
  $cell.style.paddingBottom = '176px';
  $cell.style.textAlign = 'center';

  var $stage = document.createElement('div');
  $stage.style.display = 'inline-block';
  $stage.style.width = '420px';
  $stage.style.maxWidth = '420px';
  $stage.style.padding = '22px 24px 24px';
  $stage.style.backgroundColor = 'rgba(7,15,24,0.34)';
  $stage.style.border = '1px solid rgba(255,255,255,0.22)';
  $stage.style.borderRadius = '18px';
  $stage.style.boxShadow = '0 18px 40px rgba(0,0,0,0.28)';
  $stage.style.textAlign = 'left';

  var styles = ['img { display: inline-block; width: 200px; margin: 5px; }'];
  injectStyle(styles);

  var $title1 = createTitle('.JPG Test');
  $stage.appendChild($title1);

  var $imageCard = document.createElement('div');
  $imageCard.style.padding = '14px 16px 18px';
  $imageCard.style.backgroundColor = 'rgba(255,255,255,0.14)';
  $imageCard.style.border = '1px solid rgba(255,255,255,0.18)';
  $imageCard.style.borderRadius = '14px';

  var $p1 = createParagraph('Standard JPG version of an iPlayer image.');
  $imageCard.appendChild($p1);

  var $img1 = createImage(
    '/act/test/monorepo/latest/html/img/supports-jpg-with-broadcast/iplayerImage.jpg'
  );
  $imageCard.appendChild($img1);
  $stage.appendChild($imageCard);

  $cell.appendChild($stage);
  $container.appendChild($cell);

  act.render($container, function () {
    act
      .ask(
        'With broadcast background, does the JPG image render correctly and match the description?'
      )
      .send(function (answer) {
        answer ? act.success() : act.fail('Images in JPG format are not supported.');
      });
  });
}

loadSDK(runTest);
