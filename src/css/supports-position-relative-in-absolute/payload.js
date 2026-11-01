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

  var $el1 = document.createElement('div');
  $el1.style.position = 'relative';
  $el1.style.width = '200px';
  $el1.style.height = '200px';

  var $el2 = document.createElement('div');
  $el2.style.position = 'absolute';
  $el2.style.top = '20%';
  $el2.style.left = '20%';
  $el2.style.bottom = '50%';
  $el2.style.right = '50%';
  $el2.style.margin = '0';
  $el2.style.textAlign = 'left';

  var $el3 = document.createElement('div');
  $el3.style.width = '50%';
  $el3.style.height = '50%';
  $el3.style.position = 'relative';
  $el3.style.top = '50%';
  $el3.style.left = '50%';

  $el2.appendChild($el3);
  $el1.appendChild($el2);

  act.render($el1, function () {
    var expectedOffsetTop = $el2.offsetHeight / 2;
    var expectedOffsetLeft = $el2.offsetWidth / 2;
    if ($el3.offsetTop !== expectedOffsetTop) {
      act.fail(
        'element offsetTop was wrong. Got: ' + $el3.offsetTop + ' Expected: ' + expectedOffsetTop
      );
    } else if ($el3.offsetLeft !== expectedOffsetLeft) {
      act.fail(
        'element offsetLeft was wrong. Got: ' + $el3.offsetLeft + ' Expected: ' + expectedOffsetLeft
      );
    } else {
      act.success();
    }
  });
}

loadSDK(runTest);
