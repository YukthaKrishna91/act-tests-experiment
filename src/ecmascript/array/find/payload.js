'use strict';

function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function testArrayFind() {
  var input = [
    { colour: 'black', count: 5 },
    { colour: 'blue', count: 20 },
    { colour: 'blue', count: 10 }
  ];

  var result =
    input.find &&
    input.find(function (value) {
      return value.colour === 'blue';
    });

  return result !== undefined && result.colour === 'blue' && result.count === 20;
}

function runTest() {
  act.start();
  try {
    testArrayFind() ? act.success() : act.fail(`Array.prototype.find() failed to work as expected`);
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
