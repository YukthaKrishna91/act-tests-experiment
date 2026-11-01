function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function injectStyle(styles) {
  var $style = document.createElement('style');
  $style.innerHTML = styles.join('\n');
  document.body.appendChild($style);
}

function createImage(image, width) {
  var $image = document.createElement('img');
  $image.style.width = width;
  $image.style.height = 'auto';
  $image.style.margin = '20px';
  $image.src = image;
  return $image;
}

function createTitle(text) {
  var $title = document.createElement('h2');
  $title.textContent = text;
  $title.style.marginTop = '20px';
  $title.style.marginBottom = '10px';
  $title.style.fontSize = '16px';
  return $title;
}

function loadFont(font) {
  injectStyle([
    '@font-face { font-family: ' +
      font.fontFamily +
      "; src: url('" +
      font.url +
      "') format('" +
      font.format +
      "'); font-weight: " +
      font.fontWeight +
      '; font-style: normal;}'
  ]);
}

function dummyText(font) {
  var $text = document.createElement('h1');
  $text.innerText = font.label;
  $text.style.margin = '0px';
  $text.style.cssText = `display: block; margin: 20; color: black; font-family: ${font.fontFamily}; font-size: 24px; font-weight: ${font.fontWeight};`;
  return $text;
}

function displayFontTest(font) {
  var $container = document.createElement('div');

  var testText = dummyText(font);
  var actualTitle = createTitle(`Actual - ${font.label}`);
  var expectedTitle = createTitle(`Expected - ${font.label}`);
  var expectedImg = createImage(font.expected, font.imageWidth);

  $container.appendChild(actualTitle);
  $container.appendChild(testText);
  $container.appendChild(expectedTitle);
  $container.appendChild(expectedImg);
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.textAlign = 'center';
  $container.style.marginTop = '20px';

  return $container;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.display = 'grid';
  $container.style.gridTemplateColumns = 'repeat(2, 1fr)';

  const fontWeights = [
    {
      label: 'Regular Reith',
      fontFamily: 'ReithSans',
      fontWeight: 'normal',
      name: 'reith',
      url: '/act/test/monorepo/latest/css/supports-woff-font/reith/BBCReithSans_W_Rg.woff',
      format: 'woff',
      expected: '/act/test/monorepo/latest/css/supports-woff-font/expected_regular_reith.png',
      imageWidth: '160px'
    },
    {
      label: 'Bold Reith',
      fontFamily: 'ReithSans',
      fontWeight: 700,
      name: 'reith',
      url: '/act/test/monorepo/latest/css/supports-woff-font/reith/BBCReithSans_W_Bd.woff',
      format: 'woff',
      expected: '/act/test/monorepo/latest/css/supports-woff-font/expected_bold_reith.png',
      imageWidth: '130px'
    },
    {
      label: 'Extra bold Reith',
      fontFamily: 'ReithSans',
      fontWeight: 800,
      name: 'reith',
      url: '/act/test/monorepo/latest/css/supports-woff-font/reith/BBCReithSans_W_ExBd.woff',
      format: 'woff',
      expected: '/act/test/monorepo/latest/css/supports-woff-font/expected_extra_bold_reith.png',
      imageWidth: '200px'
    },
    {
      label: 'Medium Reith',
      fontFamily: 'ReithSans',
      fontWeight: 500,
      name: 'reith',
      url: '/act/test/monorepo/latest/css/supports-woff-font/reith/BBCReithSans_W_Md.woff',
      format: 'woff',
      expected: '/act/test/monorepo/latest/css/supports-woff-font/expected_medium_reith.png',
      imageWidth: '160px'
    }
  ];

  fontWeights.forEach((fontWeight) => {
    loadFont(fontWeight);
    $container.appendChild(displayFontTest(fontWeight, $container));
  });

  act.render($container, () => {
    act
      .ask(
        'Does all of the "Actual" blocks of text match the corresponding "Expected" image (ignoring size differences)?'
      )
      .send((answer) => {
        answer ? act.success() : act.fail('Could not load WOFF font');
      });
  });
}

loadSDK(runTest);
