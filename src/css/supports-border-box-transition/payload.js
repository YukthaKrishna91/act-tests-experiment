function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createTest() {
  var $testContainer = document.createElement('div');
  $testContainer.id = 'testContainer';
  $testContainer.style.cssText =
    'display: block; margin: 0 auto;' +
    'width: 300px; height: 300px; background-color: #f5f5f5; border: 5px solid #0000ff;' +
    'padding-left: 0; transition: padding-left 1s; box-sizing: border-box;';

  var $box = document.createElement('div');
  $box.style.cssText =
    'display: block; width: 100px; height: 100px; margin-top: 95px; background-color: red;';

  $testContainer.appendChild($box);

  return $testContainer;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.height = '100%';
  $container.appendChild(createTest());

  act.render($container, function () {
    var container = document.getElementById('testContainer');
    setTimeout(function () {
      container.style.paddingLeft = '50px';
    }, 500);

    setTimeout(function () {
      container.offsetWidth === 300
        ? act.success()
        : act.fail('Cant transition in element with box-sizing set to border-box');
    }, 1000);
  });
}

loadSDK(runTest);
