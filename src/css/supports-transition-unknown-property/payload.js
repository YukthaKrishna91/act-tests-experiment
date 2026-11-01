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

  var $box = createBox();
  $box.style.left = '0';
  $box.style.transition = 'left 0.5s, definitelyNotAThing 0.5s';

  act.render($box, function () {
    $box.offsetLeft;
    $box.style.left = '200px';
    setTimeout(function () {
      if ($box.offsetLeft === 200) {
        act.fail('CSS transtion does not work when it is configured with an unknown property.');
      } else {
        act.success();
      }
    }, 200);
  });
}

loadSDK(runTest);
