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

var objectKey = {};
var stringKey = '2';

var tests = [
  {
    description: 'Constructed empty WeakMap does not contain test keys',
    run: function () {
      var weakMap = new WeakMap();
      return (
        !weakMap.has(objectKey) &&
        weakMap.get(objectKey) === undefined &&
        !weakMap.has(stringKey) &&
        weakMap.get(stringKey) === undefined
      );
    }
  },
  {
    description: 'Constructed non-empty WeakMap contains correct key',
    run: function () {
      var weakMap = new WeakMap([[objectKey, 'foo']]);
      return (
        weakMap.has(objectKey) &&
        weakMap.get(objectKey) === 'foo' &&
        !weakMap.has(stringKey) &&
        weakMap.get(stringKey) === undefined
      );
    }
  },
  {
    description: 'Constructed empty WeakMap with mapping set contains correct key',
    run: function () {
      var weakMap = new WeakMap();
      weakMap.set(objectKey, 'foo');
      return (
        weakMap.has(objectKey) &&
        weakMap.get(objectKey) === 'foo' &&
        !weakMap.has(stringKey) &&
        weakMap.get(stringKey) === undefined
      );
    }
  },
  {
    description: 'Constructed empty WeakMap with same mapping set twice contains correct key',
    run: function () {
      var weakMap = new WeakMap();
      weakMap.set(objectKey, 'foo');
      weakMap.set(objectKey, 'bar');
      return (
        weakMap.has(objectKey) &&
        weakMap.get(objectKey) === 'bar' &&
        !weakMap.has(stringKey) &&
        weakMap.get(stringKey) === undefined
      );
    }
  },
  {
    description:
      'Constructed empty WeakMap with same mapping set and then deleted does not contain key',
    run: function () {
      var weakMap = new WeakMap();
      weakMap.set(objectKey, 'foo');
      weakMap.delete(objectKey);
      return (
        !weakMap.has(objectKey) &&
        weakMap.get(objectKey) === undefined &&
        !weakMap.has(stringKey) &&
        weakMap.get(stringKey) === undefined
      );
    }
  }
];

function runTest() {
  act.start();

  if (typeof WeakMap !== 'function') {
    act.fail('The WeakMap built-in object is not implemented on this device');
    return;
  }

  var anyFailures = false;

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];

    try {
      var success = test.run();
      if (!success) {
        act.log(test.description + ' test failed');
        anyFailures = true;
      }
    } catch (error) {
      act.log([test.description + ' test failed with error', error.message]);
      anyFailures = true;
    }
  }

  if (!anyFailures) {
    act.success();
  } else {
    act.fail('ECMAScript 6 WeakMap set, has, get test failed - see log for details');
  }
}

loadSDK(runTest);
