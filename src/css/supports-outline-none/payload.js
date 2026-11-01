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
  $link.style.display = 'block';
  $link.style.height = '100px';
  $link.style.width = '100px';
  $link.style.textDecoration = 'none';
  return $link;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');

  var styles = ['#link1:focus { outline: none }'];
  injectStyle(styles);

  var $title1 = createTitle('There should be no outline surrounding the "Link" text');
  $container.appendChild($title1);

  var $link1 = createLink();
  $link1.setAttribute('id', 'link1');
  $container.appendChild($link1);

  act.render($container, function () {
    $link1.focus();
    act.ask('Do you see any outlines?').send(function (answer) {
      answer ? act.fail('outline: none  does not work correctly') : act.success();
    });
  });
}

loadSDK(runTest);
