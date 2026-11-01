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

function testJSONStringify() {
  var dummyObject = {
    name: 'Dummy',
    age: 4.48847,
    props: {
      city: true,
      country: {
        c1: 'U.K.',
        c2: 'GB'
      }
    },
    tags: ['red', 'blue', 2.5e5]
  };

  var encodedObject = JSON.stringify(dummyObject);
  var expectedJSON =
    '{"name":"Dummy","age":4.48847,"props":{"city":true,"country":{"c1":"U.K.","c2":"GB"}},"tags":["red","blue",250000]}';

  return encodedObject === expectedJSON;
}

function runTest() {
  act.start();
  try {
    testJSONStringify() ? act.success() : act.fail('JSON.stringify() output is invalid');
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
