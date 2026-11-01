function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var setupPrompt =
  'This test determines if the display is UHD capable.' +
  '\n \n If you are testing a device without a built-in display, please make sure that your device is plugged into a screen with known capabilities.' +
  '\n \n A display is UHD capable if a video mode exists with the following attributes:' +
  '\n - width >= 3840 pixels' +
  '\n - height >= 2160 pixels' +
  '\n - bt_2020 colorimetry';

function setupHandler() {
  // Can use the following fake API setup to see the functionality (questions, formatting, logic etc) of this ACT test.
  // window.getPrimaryDisplay = function () {
  //   return {
  //     physicalWidth: 100,
  //     physicalHeight: 50,
  //     videoModes: [
  //       {
  //         width: 1920,
  //         height: 1080,
  //         framerate: 25,
  //         colorimetry: ['bt_709'],
  //       },
  //       {
  //         width: 1920,
  //         height: 1080,
  //         framerate: 50,
  //         colorimetry: ['bt_709'],
  //       },
  //       {
  //         width: 3840,
  //         height: 2160,
  //         framerate: 50,
  //         colorimetry: ['bt_2020', 'bt_709'],
  //       },
  //     ],
  //   };
  // };

  if (!window.getPrimaryDisplay) {
    act.fail();
    return;
  }
  const { videoModes } = window.getPrimaryDisplay();

  if (videoModes.length !== 0) {
    act.log('VideoModes: ');
    act.log(videoModes);

    var displayInfo = videoModes.map(function (info) {
      return {
        width: info.width,
        height: info.height,
        hasBT2020Colorimetry: info.colorimetry.indexOf('bt_2020') !== -1
      };
    });

    if (isValidTvInfo(displayInfo)) {
      var markdownQuestion =
        'The Capability API indicates that a screen with the following video modes is plugged in: \n \n' +
        ' | Width | Height | BT2020 capable | \n' +
        ' |---|---|---| \n' +
        buildVideoModeRows(displayInfo) +
        '\n \n This screen will be reported as ' +
        isDeviceUHDCapable(displayInfo) +
        ' to TV applications' +
        '\n \n Is the above information as expected?';

      act.ask(markdownQuestion).send(function (userResponse) {
        if (userResponse) {
          act.success();
        } else {
          act.fail('User indicated screen info was incorrect');
        }
      });
    } else {
      act.fail(
        'Data returned by device is invalid (e.g. no width, height, colorimetry attributes)'
      );
    }
  } else {
    act.fail('No window.getPrimaryDisplay() available or no videoModes returned by it');
  }
}

function isValidTvInfo(tvInfo) {
  var valid = true;
  for (var i = 0; i < tvInfo.length; i++) {
    if (!tvInfo[i].width || !tvInfo[i].height || tvInfo[i].hasBT2020Colorimetry === undefined) {
      valid = false;
    }
  }
  return valid;
}

function buildVideoModeRows(tvInfo) {
  var rows = '';
  for (var i = 0; i < tvInfo.length; i++) {
    var w = tvInfo[i].width;
    var h = tvInfo[i].height;
    var c = tvInfo[i].hasBT2020Colorimetry;

    rows += '| ' + w + '  | ' + h + ' | ' + c + ' | \n';
  }

  return rows;
}

function isUhdCapable(width, height, hasBT2020Colorimetry) {
  return Number(width) >= 3840 && Number(height) >= 2160 && hasBT2020Colorimetry === true;
}

function isDeviceUHDCapable(tvInfo) {
  tvInfo = tvInfo || [];
  for (var i = 0; i < tvInfo.length; i++) {
    var uhdCapable = isUhdCapable(
      tvInfo[i].width,
      tvInfo[i].height,
      tvInfo[i].hasBT2020Colorimetry
    );

    if (uhdCapable) {
      return '**UHD Capable**';
    }
  }
  return '**NOT UHD Capable**';
}

function runTest() {
  act.ask(setupPrompt).addButton('Continue', null, 'primary').send(setupHandler);
}

loadSDK(runTest);
