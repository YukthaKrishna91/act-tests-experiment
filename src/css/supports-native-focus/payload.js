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
  $title.textContent = text;
  return $title;
}

function injectStyle(styles) {
  var $style = document.createElement('style');
  $style.innerHTML = styles.join('\n');
  document.body.appendChild($style);
}

function createLink() {
  var $link = document.createElement('a');
  $link.setAttribute('href', '#');
  $link.textContent = 'Link';
  return $link;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');

  var styles = ['#link1 { color: rgb(0,0,0)} #link1:focus { color: rgb(255, 0, 0) }'];
  injectStyle(styles);

  var $title1 = createTitle('Focus');
  $container.appendChild($title1);

  var $link1 = createLink();
  $link1.setAttribute('id', 'link1');
  $container.appendChild($link1);

  act.render($container, function () {
    var el = document.getElementById('link1');
    el.focus();
    var compStyles = getComputedStyle(el);

    setTimeout(function () {
      if (compStyles.color !== 'rgb(255, 0, 0)') {
        act.fail('Native focus is not supported.');
      } else {
        act.success();
      }
    }, 400);
  });
}

loadSDK(runTest);
