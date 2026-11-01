function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  $container.style.backgroundColor = 'white';
  $container.style.color = 'black';
  $container.style.height = '100%';

  var $title = document.createElement('h3');
  $title.style.display = 'inline-block';
  $title.style.margin = '10px';
  $title.style.backgroundColor = 'white';
  $title.textContent = 'border-box: actual';
  $title.style.display = 'inline-block';
  $title.style.fontSize = '15px';
  $title.style.fontWeight = 'bold';
  $title.style.color = 'black';

  var $box = document.createElement('div');
  $box.style.border = '5px dashed #0000ff';
  $box.style.width = '250px';
  $box.style.height = '50px';
  $box.style.padding = '15px';
  $box.style.margin = '10px';
  $box.style.backgroundImage =
    'url(/act/test/monorepo/latest/css/supports-background-clip-2/iplayerimage.png)';
  $box.style.display = 'inline-block';
  $box.style.backgroundPosition = 'center';
  $box.style.verticalAlign = 'top';
  $box.style.backgroundClip = 'border-box';
  $box.appendChild($title);

  var $description = document.createElement('h3');
  $description.style.cssText = 'display: block; margin:10px; padding:0;';
  $description.textContent =
    'The background image should start from the outer edge of the blue border, such that you can see the image behind the border.';

  var $expectedImage = document.createElement('img');
  $expectedImage.src =
    '/act/test/monorepo/latest/css/supports-background-clip-2/expected-border-box.png';
  $expectedImage.style.cssText = 'display: inline-block; vertical-align: top; margin: 10px;';

  $container.appendChild($description);
  $container.appendChild($box);
  $container.appendChild($expectedImage);

  act.render($container, function () {
    act
      .ask('Does the image below fit the description and look like the expected result?')
      .send(function (answer) {
        answer ? act.success() : act.fail('background-clip does not work correctly');
      });
  });
}

loadSDK(runTest);
