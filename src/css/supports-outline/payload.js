function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  var $box = document.createElement('div');
  $box.style.cssText =
    'display: inline-block; width: 300px; height: 100px; margin: 20px; background-color: #f0b651;';
  $container.appendChild($box);

  act.render($container, function () {
    var compStyle = getComputedStyle($box);

    if (!/^rgb\(\d+, \d+, \d+\) none /.test(compStyle.outline)) {
      act.fail('outline should have style "none" by default');
      return;
    }

    $box.style.outline = 'green solid 10px';

    if (compStyle.outline !== 'rgb(0, 128, 0) solid 10px') {
      act.fail('outline does not work with mutiple values');
      return;
    }

    $box.style.outlineColor = 'red';

    if (compStyle.outline !== 'rgb(255, 0, 0) solid 10px') {
      act.fail('outline-color does not work correctly');
      return;
    }

    $box.style.outlineStyle = 'dotted';

    if (compStyle.outline !== 'rgb(255, 0, 0) dotted 10px') {
      act.fail('outline-style does not work correctly');
      return;
    }

    $box.style.outlineWidth = '20px';

    if (compStyle.outline !== 'rgb(255, 0, 0) dotted 20px') {
      act.fail('outline-width does not work correctly');
      return;
    }

    $box.style.outlineOffset = '10px';

    if (compStyle.outlineOffset !== '10px') {
      act.fail('outline-offset does not work correctly');
      return;
    }

    act.success();
  });
}

loadSDK(runTest);
