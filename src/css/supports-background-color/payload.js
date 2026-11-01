function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createBox() {
  var $box = document.createElement('div');
  $box.style.width = '100px';
  $box.style.height = '100px';
  $box.style.backgroundColor = '#ff0000';
  $box.style.position = 'absolute';
  return $box;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');

  var $hexBox = createBox();
  $hexBox.style.backgroundColor = '#ff0000';
  $container.appendChild($hexBox);

  var $rgbBox = createBox();
  $rgbBox.style.backgroundColor = 'rgb(255, 0, 0)';
  $container.appendChild($rgbBox);

  var $rgbaBox = createBox();
  $rgbaBox.style.backgroundColor = 'rgba(255, 0, 0, 1)';
  $container.appendChild($rgbaBox);

  act.render($container, function () {
    var hexBoxCompStyle = getComputedStyle($hexBox);
    var rgbBoxCompStyle = getComputedStyle($rgbBox);
    var rgbaBoxCompStyle = getComputedStyle($rgbaBox);

    if (hexBoxCompStyle.backgroundColor !== 'rgb(255, 0, 0)') {
      act.fail('background-color is not correctly applied using a hex colour');
      return;
    }

    if (rgbBoxCompStyle.backgroundColor !== 'rgb(255, 0, 0)') {
      act.fail('background-color is not correctly applied using an rgb colour');
      return;
    }

    if (rgbaBoxCompStyle.backgroundColor !== 'rgb(255, 0, 0)') {
      act.fail('background-color is not correctly applied using an rgba colour code');
      return;
    }

    act.success();
  });
}

loadSDK(runTest);
