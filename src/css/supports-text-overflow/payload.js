function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createTest(props) {
  props.types.forEach(function (type) {
    props.container.appendChild(textOverFlow(type.label, type.value));
  });

  return {
    description: props.description,
    failMessage: props.failMessage
  };
}

function textOverFlow(label, value) {
  var $div = document.createElement('div');
  $div.style.cssText =
    'display: block; width: 50%; margin: 20; border: 3px solid red; padding-right: 100px;';
  var $text = document.createElement('h1');
  $text.innerText =
    label + ': Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.';
  $text.style.cssText =
    'display: block; margin: 20; color: black; font-size: 32px; font-weight: normal; white-space: nowrap; overflow: hidden;' +
    'text-overflow: ' +
    value +
    ';';
  $div.appendChild($text);
  return $div;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.height = '100%';

  var test = createTest({
    container: $container,
    description:
      'The top example (clip) should cut off mid-sentence without wrapping, and the bottom example (ellipsis) should do the same but show an ellipsis ',
    failMessage: 'values clip and-or ellipsis, could not be applied to the text-overflow property',
    types: [
      { label: 'Clip', value: 'clip' },
      { label: 'Ellipsis', value: 'ellipsis' }
    ]
  });

  act.render($container, function () {
    act.ask(test.description).send(function (answer) {
      answer ? act.success() : act.fail(test.failMessage);
    });
  });
}

loadSDK(runTest);
