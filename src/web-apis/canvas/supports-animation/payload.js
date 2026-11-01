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

function runTest() {
  act.start();

  var $container = document.createElement('div');
  var $title1 = createTitle('Canvas Animation');
  $container.appendChild($title1);

  var canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 400;
  $container.appendChild(canvas);

  var sun = new Image();
  var moon = new Image();
  var earth = new Image();
  function init() {
    sun.src = '/act/test/monorepo/latest/web-apis/canvas/supports-animation/canvas_sun.png';
    moon.src = '/act/test/monorepo/latest/web-apis/canvas/supports-animation/canvas_moon.png';
    earth.src = '/act/test/monorepo/latest/web-apis/canvas/supports-animation/canvas_earth.png';
    requestAnimationFrame(draw);
  }

  function draw() {
    var ctx = canvas.getContext('2d');

    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, 500, 500);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';
    ctx.save();
    ctx.translate(200, 220);

    // Earth
    var time = new Date();
    ctx.rotate(
      ((2 * Math.PI) / 60) * time.getSeconds() + ((2 * Math.PI) / 60000) * time.getMilliseconds()
    );
    ctx.translate(105, 0);
    ctx.drawImage(earth, -25, -25);

    // Moon
    ctx.save();
    ctx.rotate(
      ((2 * Math.PI) / 6) * time.getSeconds() + ((2 * Math.PI) / 6000) * time.getMilliseconds()
    );
    ctx.translate(0, 28.5);
    ctx.drawImage(moon, -3.5, -3.5);
    ctx.restore();

    ctx.restore();

    ctx.beginPath();
    ctx.arc(200, 220, 105, 0, Math.PI * 2, false);
    ctx.stroke();

    ctx.drawImage(sun, 95, 110, 210, 210); // different

    requestAnimationFrame(draw);
  }

  act.render($container, function () {
    init();
    act.ask('Can you see the solar system rotating correctly?').send(function (answer) {
      answer ? act.success() : act.fail('Canvas animation is not supported');
    });
  });
}

loadSDK(runTest);
