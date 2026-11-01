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

function createParagraph(text) {
  var $paragraph = document.createElement('p');
  $paragraph.style.cssText =
    'display: block; margin: 0 0 10px; padding: 4px 8px;' +
    'background-color: rgba(255,255,255,0.92); color: rgb(24,24,24); font-size: 14px;' +
    'border-radius: 8px; border: 1px solid rgba(7,15,24,0.12);';
  $paragraph.textContent = text;
  return $paragraph;
}

function createSection() {
  var $section = document.createElement('div');
  $section.style.display = 'table-cell';
  $section.style.verticalAlign = 'top';
  $section.style.width = '50%';
  $section.style.padding = '16px 18px 20px';
  $section.style.textAlign = 'left';
  $section.style.backgroundColor = 'rgba(255,255,255,0.14)';
  $section.style.border = '1px solid rgba(255,255,255,0.18)';
  $section.style.borderRadius = '14px';
  return $section;
}

function createMediaFrame() {
  var $frame = document.createElement('div');
  $frame.style.display = 'table';
  $frame.style.width = '100%';
  $frame.style.height = '220px';
  $frame.style.backgroundColor = 'rgba(255,255,255,0.88)';
  $frame.style.border = '1px solid rgba(7,15,24,0.1)';
  $frame.style.borderRadius = '12px';

  var $frameCell = document.createElement('div');
  $frameCell.style.display = 'table-cell';
  $frameCell.style.verticalAlign = 'middle';
  $frameCell.style.textAlign = 'center';
  $frame.appendChild($frameCell);

  return {
    frame: $frame,
    cell: $frameCell
  };
}

function createImage(image, srcset) {
  var $image = document.createElement('img');
  $image.src = image;
  if (srcset) {
    $image.setAttribute('srcset', srcset);
  }
  $image.style.cssText =
    'display: block; width: 150px; height: 150px; margin: 0 auto; background-color: white;';
  return $image;
}

function loadImage($image) {
  return new Promise(function imageLoadPromise(resolve, reject) {
    if ($image.complete && $image.naturalWidth > 0) {
      resolve($image);
      return;
    }

    $image.addEventListener('load', function imageOnLoad() {
      resolve($image);
    });

    $image.addEventListener('error', function imageOnError() {
      reject(new Error('There was an error loading an image'));
    });
  });
}

function getSelectionMessage($image) {
  var selectedSource = $image.currentSrc || '';

  if (selectedSource.indexOf('cross-test-720.png') !== -1) {
    return 'Detected 1280 x 720: the image below should match the reference image on the right';
  }

  if (selectedSource.indexOf('cross-test-1080.png') !== -1) {
    return 'Detected 1920 x 1080: the image below should have more grid squares than the reference image on the right';
  }

  if (selectedSource.indexOf('cross-test-2160.png') !== -1) {
    return 'Detected 3840 x 2160: the image below should have more grid squares than the reference image on the right';
  }

  return 'Unable to confirm the selected srcset candidate automatically. Compare whether the left responsive image shows more detail than the fixed 1280x720 reference image.';
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
  $stage.style.width = '900px';
  $stage.style.maxWidth = '900px';
  $stage.style.padding = '28px 32px 32px';
  $stage.style.backgroundColor = 'rgba(7,15,24,0.34)';
  $stage.style.border = '1px solid rgba(255,255,255,0.22)';
  $stage.style.borderRadius = '18px';
  $stage.style.boxShadow = '0 18px 40px rgba(0,0,0,0.28)';
  $stage.style.textAlign = 'left';

  var assetBase = '/act/test/monorepo/latest/html/img/supports-higher-resolutions/';
  var responsiveSrcset =
    assetBase +
    'cross-test-2160.png 3x, ' +
    assetBase +
    'cross-test-1080.png 1.5x, ' +
    assetBase +
    'cross-test-720.png 1x';

  var $title1 = createTitle('Higher Resolution Image Test');
  $stage.appendChild($title1);

  var $intro = createParagraph(
    'The left image uses srcset to choose the best asset for the device graphics plane. The right image is always the 1280x720 reference image.'
  );
  $stage.appendChild($intro);

  var $imagesRow = document.createElement('div');
  $imagesRow.style.display = 'table';
  $imagesRow.style.tableLayout = 'fixed';
  $imagesRow.style.width = '100%';
  $imagesRow.style.borderSpacing = '18px 0';
  $imagesRow.style.marginLeft = '-18px';
  $imagesRow.style.marginRight = '-18px';

  var $image1 = createSection();

  var $p1 = createParagraph('');
  $p1.style.height = '82px';
  $p1.style.boxSizing = 'border-box';
  $image1.appendChild($p1);

  var image1Frame = createMediaFrame();

  var $img1 = createImage(assetBase + 'cross-test-720.png', responsiveSrcset);
  image1Frame.cell.appendChild($img1);
  $image1.appendChild(image1Frame.frame);
  $imagesRow.appendChild($image1);

  var $image2 = createSection();

  var $p2 = createParagraph(
    'Reference image: this always uses the 1280 x 720 asset so you can compare it against the responsive image on the left.'
  );
  $p2.style.height = '82px';
  $p2.style.boxSizing = 'border-box';
  $image2.appendChild($p2);

  var image2Frame = createMediaFrame();

  var $img2 = createImage(assetBase + 'cross-test-720.png');
  image2Frame.cell.appendChild($img2);
  $image2.appendChild(image2Frame.frame);
  $imagesRow.appendChild($image2);
  $stage.appendChild($imagesRow);

  $cell.appendChild($stage);
  $container.appendChild($cell);

  act.render($container, function () {
    Promise.all([loadImage($img1), loadImage($img2)])
      .then(function imageLoaded(images) {
        $p1.textContent = getSelectionMessage(images[0]);

        act
          .ask(
            'With background video, compare the two square images. If the device only supports a 1280x720 graphics plane, the images should match. If the device supports a higher-resolution graphics plane, the left responsive image should show finer grid detail than the right 1280x720 reference image.'
          )
          .send(function (answer) {
            answer
              ? act.success()
              : act.fail(
                  'Higher-resolution srcset image selection did not match the expected result.'
                );
          });
      })
      .catch(function imageRejected() {
        act.fail('One or more higher-resolution test images failed to load.');
      });
  });
}

loadSDK(runTest);
