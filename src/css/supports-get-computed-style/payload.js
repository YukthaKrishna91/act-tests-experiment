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

function injectStyle(styles) {
  var $style = document.createElement('style');
  $style.innerHTML = styles.join('\n');
  document.body.appendChild($style);
}

function runTest() {
  act.start();

  injectStyle(['#box {', '  margin: 1px;', '  color: rgb(255, 0, 0);', '}']);

  var $box = createBox();
  $box.id = 'box';
  $box.style.margin = '10px';
  $box.style.marginLeft = '5px';

  act.render($box, function () {
    if (typeof window.getComputedStyle !== 'function') {
      act.fail('function missing');
      return;
    }

    var computed = window.getComputedStyle($box);
    if (computed.marginRight !== '10px') {
      act.fail('incorrect marginRight');
      return;
    }

    if (computed.marginLeft !== '5px') {
      act.fail('incorrect marginLeft');
      return;
    }

    if (computed.color !== 'rgb(255, 0, 0)') {
      act.fail('incorrect color');
      return;
    }

    act.success();
  });
}

loadSDK(runTest);
