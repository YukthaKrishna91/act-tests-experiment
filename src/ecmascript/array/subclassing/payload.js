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

function testArraySubclassing() {
  return eval(`class C extends Array {}
  var c = new C();
  var len1 = c.length;
  c[0] = "foo";
  c[2] = "bar";
  var len2 = c.length;
  c.length = 1;
  var len3 = c.length;
  var c2 = c[2];
  len1 === 0 && len2 === 3 && len3 === 1 && c2 === undefined`);
}

function runTest() {
  act.start();
  try {
    testArraySubclassing()
      ? act.success()
      : act.fail(`Array subclassing failed to work as expected`);
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
