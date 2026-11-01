function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createSVGText(text) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.innerHTML =
    '<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">' +
    '<style>' +
    '.groovy { font: italic 38px serif; fill: red; }' +
    '</style>' +
    '<text x="20" y="30" class="groovy">' +
    text +
    '</text>' +
    '</svg>';
  return svg;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  var svgText = createSVGText('very nice!');
  $container.appendChild(svgText);
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.height = '100%';

  act.render($container, function () {
    act.ask("Can you see the red text below that reads 'very nice!'").send(function (answer) {
      answer ? act.success() : act.fail('Could not render SVG text');
    });
  });
}

loadSDK(runTest);
