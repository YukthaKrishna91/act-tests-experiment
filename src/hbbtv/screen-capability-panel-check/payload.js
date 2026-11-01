function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function getCapabilitiesElement() {
  var elements = document.getElementsByTagName('object');
  if (elements && elements.length) {
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].type.toLowerCase() === 'application/oipfcapabilities') {
        return elements[i];
      }
    }
  }
}

function getCapabilitiesXML(element) {
  if (element && element.xmlCapabilities) {
    return element.xmlCapabilities;
  }
}
const definitions = {
  minimumWidthForUhdSupport: 3840,
  minimumHeightForUhdSupport: 2160
};

function isUhdCapable(width, height, hasBT2020Colorimetry) {
  return (
    Number(width) >= definitions.minimumWidthForUhdSupport &&
    Number(height) >= definitions.minimumHeightForUhdSupport &&
    hasBT2020Colorimetry === true
  );
}

function parseVideoFormats(xmlDocument) {
  var videoDisplayFormat = xmlDocument.getElementsByTagName('video_display_format');

  if (videoDisplayFormat.length <= 0) {
    act.fail('Video_display_format is invalid (e.g: no width, height, colorimetry attributes)');
  }

  var output = [];
  for (var i = 0; i < videoDisplayFormat.length; i++) {
    var width = parseInt(videoDisplayFormat[i].attributes.width.value) || 0;
    var height = parseInt(videoDisplayFormat[i].attributes.height.value) || 0;
    var colorimetry = videoDisplayFormat[i].attributes.colorimetry.value || [];
    var hasBT2020Colorimetry = colorimetry.indexOf('bt2020') !== -1;
    var resolution = [width, height].join('x');

    var uhdCapable = isUhdCapable(width, height, hasBT2020Colorimetry);

    output.push({
      width: width,
      height: height,
      colorimetry: colorimetry,
      resolution: resolution,
      hasBT2020Colorimetry: hasBT2020Colorimetry,
      uhdCapable: uhdCapable
    });
  }

  act.log(output);
  return output;
}

function buildVideoModeRows(tvInfo) {
  var rows = '';
  for (var i = 0; i < tvInfo.length; i++) {
    var w = tvInfo[i].width;
    var h = tvInfo[i].height;
    var c = tvInfo[i].hasBT2020Colorimetry;

    rows += '| ' + w.toString() + '  | ' + h.toString() + ' | ' + c.toString() + ' | \n';
  }

  return rows;
}

function isDeviceUHDCapable(tvInfo) {
  tvInfo = tvInfo || [];
  for (var i = 0; i < tvInfo.length; i++) {
    if (tvInfo[i].uhdCapable) {
      return '**UHD Capable**';
    }
  }
  return '**NOT UHD Capable**';
}

function setupHandler() {
  var timeout = setTimeout(function () {
    act.fail('HBBTV display capability information is unavailable.');
  }, 5000);

  const xmlDocument = getCapabilitiesXML(getCapabilitiesElement());

  if (!xmlDocument) {
    act.fail('No XML Document found.');
    return;
  }

  var videoFormats = parseVideoFormats(xmlDocument);

  if (!videoFormats.length) {
    act.fail('No video formats found.');
    return;
  }

  clearTimeout(timeout);

  var markdownQuestion =
    'The capability api indicates that a screen with the following video modes: \n \n' +
    ' | Width | Height  | BT2020 capable | \n' +
    ' |---|---|---| \n' +
    buildVideoModeRows(videoFormats) +
    '\n \n This screen will be reported as ' +
    isDeviceUHDCapable(videoFormats) +
    ' to TV applications' +
    '\n \n Is the above information as expected?';

  act.ask(markdownQuestion).send(function (userResponse) {
    if (userResponse) {
      act.success();
    } else {
      act.fail('User indicated screen info was incorrect');
    }
  });
}

var setupPrompt =
  'This test determines if the display is UHD capable.' +
  '\n \n If you are testing a device without a built-in display, please make sure that your device is plugged into a screen with known capabilities.' +
  '\n \n A display is UHD capable if a video_display_format exists with the following attributes:' +
  '\n - width >= 3840 pixels' +
  '\n - height >= 2160 pixels' +
  '\n - bt_2020 colorimetry';

function runTest() {
  act.start();
  act.ask(setupPrompt).addButton('Continue', null, 'primary').send(setupHandler);
}

loadSDK(runTest);
