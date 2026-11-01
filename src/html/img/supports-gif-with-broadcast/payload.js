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

  var styles = ['img { display: inline-block; width: 200px; margin: 0; vertical-align: middle; }'];
  injectStyle(styles);

  var $title1 = createTitle('.GIF Test');
  $stage.appendChild($title1);

  var $p = createParagraph('There should be two GIF images below.');
  $stage.appendChild($p);

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

  var $p1 = createParagraph('Standard GIF version of an iPlayer image.');
  $p1.style.height = '88px';

  var $image1Frame = document.createElement('div');
  $image1Frame.style.display = 'table';
  $image1Frame.style.width = '100%';
  $image1Frame.style.height = '220px';
  $image1Frame.style.backgroundColor = 'rgba(255,255,255,0.88)';
  $image1Frame.style.border = '1px solid rgba(7,15,24,0.1)';
  $image1Frame.style.borderRadius = '12px';

  var $image1FrameCell = document.createElement('div');
  $image1FrameCell.style.display = 'table-cell';
  $image1FrameCell.style.verticalAlign = 'middle';
  $image1FrameCell.style.textAlign = 'center';

  $image1.appendChild($p1);
  $image1Frame.appendChild($image1FrameCell);
  $image1.appendChild($image1Frame);
  $imagesRow.appendChild($image1);

  var $image2 = document.createElement('div');
  $image2.style.display = 'table-cell';
  $image2.style.verticalAlign = 'top';
  $image2.style.width = '50%';
  $image2.style.padding = '16px 18px 20px';
  $image2.style.backgroundColor = 'rgba(255,255,255,0.14)';
  $image2.style.border = '1px solid rgba(255,255,255,0.18)';
  $image2.style.borderRadius = '14px';
  var $p2 = createParagraph('Animated GIF of a donut that should be spinning.');
  $p2.style.height = '88px';

  var $image2Frame = document.createElement('div');
  $image2Frame.style.display = 'table';
  $image2Frame.style.width = '100%';
  $image2Frame.style.height = '220px';
  $image2Frame.style.backgroundColor = 'rgba(255,255,255,0.88)';
  $image2Frame.style.border = '1px solid rgba(7,15,24,0.1)';
  $image2Frame.style.borderRadius = '12px';

  var $image2FrameCell = document.createElement('div');
  $image2FrameCell.style.display = 'table-cell';
  $image2FrameCell.style.verticalAlign = 'middle';
  $image2FrameCell.style.textAlign = 'center';

  $image2.appendChild($p2);
  $image2Frame.appendChild($image2FrameCell);
  $image2.appendChild($image2Frame);
  $imagesRow.appendChild($image2);
  $stage.appendChild($imagesRow);

  $cell.appendChild($stage);
  $container.appendChild($cell);

  createImage('/act/test/monorepo/latest/html/img/supports-gif-with-broadcast/iplayerImage.gif')
    .then(function fillfilled(image) {
      var $img1 = image;
      $image1FrameCell.appendChild($img1);
    })
    .catch(function rejected() {
      act.fail('The standard GIF image failed to load');
    });

  createImage('/act/test/monorepo/latest/html/img/supports-gif-with-broadcast/donut.gif')
    .then(function fillfilled(image) {
      var $img2 = image;
      $image2FrameCell.appendChild($img2);
    })
    .catch(function rejected() {
      act.fail('The animated GIF image failed to load');
    });

  act.render($container, function () {
    act
      .ask(
        'With broadcast background, do both GIF images render correctly and match the descriptions? The iPlayer image should be static, and the donut should be spinning.'
      )
      .send(function (answer) {
        answer ? act.success() : act.fail('Images in GIF format are not supported.');
      });
  });
}

loadSDK(runTest);
