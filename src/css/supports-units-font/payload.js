function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function testFont(unit, label) {
  var $text = document.createElement('h1');
  $text.id = label;
  $text.innerText = label + ': Lorem ipsum dolor sit amet.';
  $text.style.cssText =
    'display: block; margin: 20; color: white; font-size: ' + unit + '; font-weight: normal;';
  return $text;
}

function runTest() {
  act.start();

  document.querySelector(':root').style.fontSize = '16px'; // make sure root font size is standard for rem units
  var $container = document.createElement('div');
  $container.style.height = '100%';
  $container.style.fontSize = '16px';

  var testCases = [
    { label: 'Pixels', value: '32px' },
    { label: 'Points', value: '24pt' },
    { label: 'Picas', value: '2pc' },
    { label: 'Rem', value: '2rem' },
    { label: 'Em', value: '2em' },
    { label: 'Percent', value: '200%' }
  ];

  testCases.forEach(function (test) {
    $container.appendChild(testFont(test.value, test.label));
  });

  act.render($container, function () {
    for (var i in testCases) {
      var value = testCases[i].value;
      var label = testCases[i].label;
      var styles = window.getComputedStyle(document.getElementById(label));
      if (styles.fontSize !== '32px') {
        act.fail(
          label +
            ' font size units could not be applied correctly (expected ' +
            value +
            ' to match 32px, got ' +
            styles.fontSize +
            ')'
        );
        return;
      }
    }

    act.success();
  });
}

loadSDK(runTest);
