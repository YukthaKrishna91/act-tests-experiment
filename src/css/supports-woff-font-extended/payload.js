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
  var style = document.createElement('style');
  style.innerHTML = styles.join('\n');
  document.getElementsByTagName('head')[0].appendChild(style);
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
      '; font-style: normal; }'
  ]);
}

var REGULAR_CHARS =
  '!"#$%&\' () * - + ,. / 0123456789 :; <=> ?@ A B C D E F G H I J K L M N O P Q R S T U V W X Y Z [] ^ _ ` ' +
  'a b c d e f g h i j k l m n o p q r s t u v w x y z {|} ~ ¡ ¢ £ ¤ ¥ ¦ § ¨ © ª « ¬ ® ¯ ° ± ² ³ ´ µ ¶ · ¸ ¹ º » ¼ ½ ¾ ¿ ' +
  'À Á Â Ã Ä Å Æ Ç È É Ê Ë Ì Í Î Ï Ð Ñ Ò Ó Ô Õ Ö × Ø Ù Ú Û Ü Ý Þ ß à á â ã ä å æ ç è é ê ë ì í î ï ð ñ ò ó ô õ ö ÷ ø ù ú û ü ý þ ÿ ' +
  'Œ œ Š š Ŵ ŵ Ŷ ŷ Ÿ Ž ž ƒ ˆ ˜ Ẁ ẁ Ẃ ẃ Ẅ ẅ Ỳ ỳ – — ‘’‚ “”„ † ‡ • … ‰ ‹› ⁄ € ™ ←↑→↓ ♫ ✓✗';

var COMPARISON_STAGE_WIDTH = '1200px';
var STAGE_TOP_PADDING = '0px';
var STAGE_PADDING = '12px';

function createSectionTitle(text) {
  var title = document.createElement('div');
  title.textContent = text;
  title.style.marginBottom = STAGE_PADDING;
  title.style.fontSize = '20px';
  title.style.fontWeight = '700';
  title.style.letterSpacing = '0.02em';
  return title;
}

function createPanel() {
  var panel = document.createElement('div');
  panel.style.width = '100%';
  panel.style.padding = STAGE_PADDING;
  panel.style.backgroundColor = '#ffffff';
  panel.style.border = '1px solid #d9d9d9';
  panel.style.boxSizing = 'border-box';
  return panel;
}

function createActualText() {
  var glyphs = document.createElement('div');
  glyphs.style.fontFamily = 'ReithSansGlyphTest';
  glyphs.style.fontSize = '24px';
  glyphs.style.lineHeight = '1.5';
  glyphs.style.whiteSpace = 'pre-wrap';
  glyphs.style.padding = '5px';
  glyphs.style.color = '#000000';
  glyphs.textContent = REGULAR_CHARS;
  return glyphs;
}

function createReferenceImage() {
  var wrapper = document.createElement('div');
  wrapper.style.display = 'block';
  wrapper.style.width = '100%';
  wrapper.style.height = '1px';
  wrapper.style.overflow = 'hidden';
  wrapper.style.backgroundColor = '#f5f5f5';

  var image = document.createElement('img');
  image.src =
    '/act/test/monorepo/latest/css/supports-woff-font-extended/expected_regular_reith.png';
  image.alt = 'Reference rendering of the Reith regular character set';
  image.style.width = '100%';
  image.style.height = '100%';
  image.style.display = 'block';
  image.onerror = function () {
    image.style.display = 'none';
  };

  wrapper.appendChild(image);

  return wrapper;
}

function syncReferenceHeight(actualText, referenceImageWrapper) {
  function applyHeight() {
    var actualHeight = actualText.offsetHeight;
    if (actualHeight > 0) {
      referenceImageWrapper.style.height = actualHeight + 'px';
    }
  }

  applyHeight();

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(applyHeight);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      applyHeight();
    });
  }
}

function runTest() {
  act.start();
  try {
    loadFont({
      fontFamily: 'ReithSansGlyphTest',
      fontWeight: 'normal',
      url: '/act/test/monorepo/latest/css/supports-woff-font-extended/reith/BBCReithSans_W_Rg.woff',
      format: 'woff'
    });

    var container = document.createElement('div');
    container.style.backgroundColor = '#00000090';
    container.style.color = '#000000';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'table';
    container.style.paddingTop = STAGE_TOP_PADDING;
    container.style.boxSizing = 'border-box';

    var cell = document.createElement('div');
    cell.style.display = 'table-cell';
    cell.style.verticalAlign = 'top';
    cell.style.textAlign = 'center';

    var stage = document.createElement('div');
    stage.style.display = 'inline-block';
    stage.style.width = '100%';
    stage.style.maxWidth = COMPARISON_STAGE_WIDTH;
    stage.style.padding = STAGE_PADDING;
    stage.style.boxSizing = 'border-box';
    stage.style.textAlign = 'left';

    var heading = document.createElement('h2');
    heading.textContent = 'Reith Regular Font Comparison';
    heading.style.color = '#ffffff';
    heading.style.margin = '0 0 10px';
    heading.style.fontSize = '22px';

    var actualPanel = createPanel();
    actualPanel.style.marginBottom = '16px';
    actualPanel.appendChild(createSectionTitle('Actual'));
    var actualText = createActualText();
    actualPanel.appendChild(actualText);

    var referencePanel = createPanel();
    referencePanel.appendChild(createSectionTitle('Expected'));
    var referenceImageWrapper = createReferenceImage();
    referencePanel.appendChild(referenceImageWrapper);

    stage.appendChild(heading);
    stage.appendChild(actualPanel);
    stage.appendChild(referencePanel);
    cell.appendChild(stage);
    container.appendChild(cell);

    act.render(container, function () {
      syncReferenceHeight(actualText, referenceImageWrapper);

      act
        .ask(
          'Do the rendered Reith alphanumeric characters match the expected image, with particular focus on the capital letter "Q" and character spacing? The expected image may look slightly blurred on some UHD screens because the reference PNG is scaled by the display/browser. Do not fail the test for this blur alone if the glyph shapes and spacing still match. Please ignore any other special characters shown.'
        )
        .addButton('Yes', true, 'primary')
        .addButton('No', false, 'warning')
        .send(function (response) {
          return response
            ? act.success()
            : act.fail('The rendered Reith Regular text does not match the expected image.');
        });
    });
  } catch (e) {
    act.error(e);
  }
}

loadSDK(runTest);
