function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function roughlyEqual(current, expected, window) {
  return current - window <= expected && current + window >= expected;
}

function createDiv(value, label) {
  var $box = document.createElement('div');
  $box.style.cssText =
    'display: inline-block; margin: 50px; outline: blue 3px solid; width: 64px; height: 64px;';
  $box.style.transform = 'rotate(' + value + ')';
  $box.id = label;
  var $label = document.createElement('p');
  $label.innerText = label;
  $label.style.textAlign = 'center';
  $label.style.fontSize = '12px';
  $box.appendChild($label);

  return $box;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');

  var testCases = [
    { label: 'Degrees', value: '30deg', negative: false },
    { label: 'Radians', value: '0.523599rad', negative: false },
    { label: 'Gradians', value: '33.3333grad', negative: false },
    { label: 'Turns', value: '0.083333turn', negative: false }
  ];

  testCases.forEach(function (test) {
    testCases.push({ label: 'Negative ' + test.label, value: '-' + test.value, negative: true });
  });

  testCases.forEach(function (test) {
    $container.appendChild(createDiv(test.value, test.label));
  });

  act.render($container, function () {
    for (var i in testCases) {
      var label = testCases[i].label;
      var isNegative = testCases[i].negative;
      var styles = window.getComputedStyle(document.getElementById(label));

      if (!styles.transform) {
        act.fail('Could not apply transform');
        return;
      }

      var matrix = styles.transform.replace('matrix(', '').replace(')', '').split(', ');
      var expectedPositive = [0.866, 0.5, -0.5, 0.866, 0, 0];
      var expectedNegative = [0.866, -0.5, 0.5, 0.866, 0, 0];
      var valid = matrix.every(function (value, index) {
        return roughlyEqual(
          parseFloat(value),
          (isNegative ? expectedNegative : expectedPositive)[index],
          0.01
        );
      });

      if (!valid) {
        act.fail('Rotating an element with ' + label + ' units did not work as expected');
        return;
      }
    }

    act.success();
  });
}

loadSDK(runTest);
