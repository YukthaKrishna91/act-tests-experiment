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
  $cell.style.paddingTop = '36px';
  $cell.style.paddingBottom = '160px';
  $cell.style.textAlign = 'center';

  var $stage = document.createElement('div');
  $stage.style.display = 'inline-block';
  $stage.style.width = '760px';
  $stage.style.maxWidth = '760px';
  $stage.style.padding = '28px 32px 32px';
  $stage.style.backgroundColor = 'rgba(7,15,24,0.34)';
  $stage.style.border = '1px solid rgba(255,255,255,0.22)';
  $stage.style.borderRadius = '18px';
  $stage.style.boxShadow = '0 18px 40px rgba(0,0,0,0.28)';
  $stage.style.textAlign = 'left';

  var styles = [
    'img { display: inline-block; width: 200px; margin: 5px; }',
    '.filled { background-color: rgb(150,0,150); }'
  ];
  injectStyle(styles);

  var $title1 = createTitle('.PNG Test');
  $stage.appendChild($title1);

  var $intro = createParagraph('There should be two PNG images below.');
  $stage.appendChild($intro);

  var $imagesRow = document.createElement('div');
  $imagesRow.style.display = 'table';
  $imagesRow.style.tableLayout = 'fixed';
  $imagesRow.style.width = '100%';
  $imagesRow.style.borderSpacing = '18px 0';
  $imagesRow.style.marginLeft = '-18px';
  $imagesRow.style.marginRight = '-18px';

  var $image1 = document.createElement('div');
  $image1.style.display = 'table-cell';
  $image1.style.verticalAlign = 'top';
  $image1.style.width = '50%';
  $image1.style.padding = '16px 18px 20px';
  $image1.style.backgroundColor = 'rgba(255,255,255,0.14)';
  $image1.style.border = '1px solid rgba(255,255,255,0.18)';
  $image1.style.borderRadius = '14px';

  var $p1 = createParagraph('Standard PNG version of an iPlayer image.');
  $p1.style.height = '88px';
  $image1.appendChild($p1);

  var $img1 = createImage(
    '/act/test/monorepo/latest/html/img/supports-png-with-broadcast/iplayerImage.png'
  );
  $image1.appendChild($img1);
  $imagesRow.appendChild($image1);

  var $image2 = document.createElement('div');
  $image2.style.display = 'table-cell';
  $image2.style.verticalAlign = 'top';
  $image2.style.width = '50%';
  $image2.style.padding = '16px 18px 20px';
  $image2.style.backgroundColor = 'rgba(255,255,255,0.14)';
  $image2.style.border = '1px solid rgba(255,255,255,0.18)';
  $image2.style.borderRadius = '14px';

  var $p2 = createParagraph(
    'Transparent PNG version of an iPlayer image. The transparent areas should show a purple background.'
  );
  $p2.style.height = '88px';
  $image2.appendChild($p2);

  var $img2 = createImage(
    '/act/test/monorepo/latest/html/img/supports-png-with-broadcast/iplayerImageTransparent.png'
  );
  $img2.className = 'filled';
  $image2.appendChild($img2);
  $imagesRow.appendChild($image2);
  $stage.appendChild($imagesRow);

  $cell.appendChild($stage);
  $container.appendChild($cell);

  act.render($container, function () {
    act
      .ask(
        'With broadcast background, do both PNG images render correctly and match the descriptions? The second image should show purple through its transparent areas.'
      )
      .send(function (answer) {
        answer ? act.success() : act.fail('Images in PNG format are not supported.');
      });
  });
}

loadSDK(runTest);
