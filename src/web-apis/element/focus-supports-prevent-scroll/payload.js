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

function createLink() {
  var $link = document.createElement('a');
  $link.setAttribute('href', '#');
  $link.textContent = 'Link';
  $link.tabIndex = '-1';
  return $link;
}
function runTest() {
  act.start();

  var $container = document.createElement('div');
  var $title = createTitle('Prevent auto scrolling on focus');
  $container.appendChild($title);
  var $link = createLink();
  $link.style.backgroundColor = 'red';
  $link.style.display = 'block';
  $link.style.position = 'absolute';
  $link.style.bottom = '-300px';
  $link.style.width = '200px';
  $link.style.height = '200px';
  $link.setAttribute('tabindex', '-1');

  act.render($container, function () {
    // needs to be <body /> so that it's not inside an act container (position: fixed; width: 100%; height: 100%;) which prevents the window scrolling
    document.body.appendChild($link);

    window.setTimeout(function () {
      window.scrollTo(0, 0);
      var scrollYBefore = window.scrollY;
      if (scrollYBefore !== 0) {
        act.fail('Initial scroll to top failed.');
        return;
      }
      $link.focus({ preventScroll: true });
      window.setTimeout(function () {
        var scrollYAfter = window.scrollY;
        if (scrollYBefore !== scrollYAfter) {
          act.fail('Scroll position changed and it should not have.');
        } else {
          act.success();
        }
      }, 500);
    }, 500);
  });
}

loadSDK(runTest);
