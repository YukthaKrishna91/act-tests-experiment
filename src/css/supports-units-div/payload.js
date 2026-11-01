function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function testDiv(unit, label) {
  var $box = document.createElement('div');
  $box.id = label;
  $box.style.cssText =
    'display: inline-block; margin: 50px; outline: blue 3px solid; width: ' +
    unit +
    '; height: ' +
    unit +
    ';';
  var $label = document.createElement('p');
  $label.innerText = label;
  $box.appendChild($label);
  return $box;
}

function runTest() {
  act.start();

  document.querySelector(':root').style.fontSize = '16px'; // make sure root font size is standard for rem units
  var $container = document.createElement('div');
  $container.style.height = '100%';
  $container.style.fontSize = '16px';

  var testCases = [
    { label: 'Pixels', value: '64px' },
    { label: 'Points', value: '48pt' },
    { label: 'Picas', value: '4pc' },
    { label: 'Rem', value: '4rem' },
    { label: 'Em', value: '4em' }
  ];

  testCases.forEach(function (test) {
    $container.appendChild(testDiv(test.value, test.label));
  });

  act.render($container, function () {
    for (var i in testCases) {
      var value = testCases[i].value;
      var label = testCases[i].label;
      var styles = window.getComputedStyle(document.getElementById(label));
      if (styles.width !== '64px' || styles.height !== '64px') {
        act.fail(
          label +
            ' size units could not be applied to a div (expected ' +
            value +
            ' to match 64px, got ' +
            styles.width +
            ')'
        );
        return;
      }
    }

    act.success();
  });
}

loadSDK(runTest);
