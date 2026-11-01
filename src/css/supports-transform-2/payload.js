function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var CAROUSELS = 15;
var ITEMS_PER_CAROUSEL = 20;

function translate(element, axis, amount) {
  var transformValue = 'translate' + axis + '(' + Math.round(amount) + 'px)';

  element.style.webkitTransform = transformValue;
  element.style.MozTransform = transformValue;
  element.style.OTransform = transformValue;
  element.style.transform = transformValue;
}

function createTest(container) {
  container.id = 'wrapper';
  translate(container, 'Y', 0);
  container.style.transition = 'transform 5s cubic-bezier(0, 0, 0.3, 1)';
  for (var i = 0; i < CAROUSELS; i++) {
    var carousel = document.createElement('div');
    carousel.style.backgroundColor = ['yellow', 'blue', 'green', 'purple'][i % 4];
    carousel.style.display = 'inline-block';
    carousel.style.position = 'relative';
    carousel.style.whiteSpace = 'nowrap';
    translate(container, 'X', 0);
    carousel.style.transition = 'transform 1s cubic-bezier(0, 0, 0.3, 1)';
    carousel.className = 'carousel';

    for (var j = 0; j < ITEMS_PER_CAROUSEL; j++) {
      var item = document.createElement('img');
      item.src = '/act/test/monorepo/latest/css/supports-transform-2/test-card.jpg';
      item.style.cssText = 'width: 260px; margin: 20px; display: inline-block';
      carousel.appendChild(item);
    }

    container.appendChild(carousel);
  }
}

function runTest() {
  act.start();

  var animationState = 0;
  var $container = document.createElement('div');
  $container.style.position = 'relative';
  $container.style.backgroundColor = 'red';
  var wrapper = document.createElement('div');
  $container.appendChild(wrapper);

  createTest(wrapper);

  var moveBoundary = (ITEMS_PER_CAROUSEL - Math.ceil(window.innerWidth / 300)) * 300;

  act.render($container, function () {
    var wrapper = document.getElementById('wrapper');
    var carousels = document.getElementsByClassName('carousel');
    setInterval(function () {
      if (animationState % 300 === 0) {
        translate(wrapper, 'Y', -(wrapper.offsetHeight * 0.5));
      } else if (animationState % 150 === 0) {
        translate(wrapper, 'Y', 0);
      }

      var carousel = carousels[animationState % carousels.length];
      var moveBy = (Math.floor(animationState / carousels.length) + 1) * ITEMS_PER_CAROUSEL * 5;
      // Stops them revealing background under the righthand side
      if (moveBy < moveBoundary) {
        translate(carousel, 'X', -moveBy);
      }
      animationState++;
    }, 50);

    setTimeout(function () {
      act
        .ask(
          'Are any areas of the page flickering or disappearing as they move, showing the red background underneath?'
        )
        .addButton('Yes, red areas are visible', false, 'danger')
        .addButton('No', true, 'secondary')
        .send(function (response) {
          response
            ? act.success()
            : act.fail('Visual glitching occurred when rendering multiple transform layers');
        });
    }, 5000);
  });
}

loadSDK(runTest);
