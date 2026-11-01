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

function testJSONParse() {
  var jsonString =
    '{"util": { }, "key1":"my_str","key2":["my","array"],"key3":{"my":"object","with_numbers":[1,2,3,4.5678],"and_also":9}}';
  var decodedObject = JSON.parse(jsonString);

  if (
    decodedObject.key1 === 'my_str' &&
    decodedObject.key2.length === 2 &&
    decodedObject.key2[1] === 'array' &&
    decodedObject.key3.with_numbers[3] === 4.5678 &&
    decodedObject.key3.and_also === 9 &&
    typeof Object.getPrototypeOf(decodedObject.util) === 'object'
  ) {
    return true;
  } else {
    return false;
  }
}

function runTest() {
  act.start();
  try {
    testJSONParse()
      ? act.success()
      : act.fail(`JSON.parse() failed to parse the JSON input correctly`);
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
