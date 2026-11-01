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
    description: 'Constructed empty Map does not contain test keys',
    run: function () {
      var map = new Map();
      return (
        !map.has(objectKey) &&
        map.get(objectKey) === undefined &&
        !map.has(stringKey) &&
        map.get(stringKey) === undefined
      );
    }
  },
  {
    description: 'Constructed non-empty Map contains correct key',
    run: function () {
      var map = new Map([[objectKey, 'foo']]);
      return (
        map.has(objectKey) &&
        map.get(objectKey) === 'foo' &&
        !map.has(stringKey) &&
        map.get(stringKey) === undefined
      );
    }
  },
  {
    description: 'Constructed empty Map with mapping set contains correct key',
    run: function () {
      var map = new Map();
      map.set(objectKey, 'foo');
      return (
        map.has(objectKey) &&
        map.get(objectKey) === 'foo' &&
        !map.has(stringKey) &&
        map.get(stringKey) === undefined
      );
    }
  },
  {
    description: 'Constructed empty Map with same mapping set twice contains correct key',
    run: function () {
      var map = new Map();
      map.set(objectKey, 'foo');
      map.set(objectKey, 'bar');
      return (
        map.has(objectKey) &&
        map.get(objectKey) === 'bar' &&
        !map.has(stringKey) &&
        map.get(stringKey) === undefined
      );
    }
  },
  {
    description:
      'Constructed empty Map with same mapping set and then deleted does not contain key',
    run: function () {
      var map = new Map();
      map.set(objectKey, 'foo');
      map.delete(objectKey);
      return (
        !map.has(objectKey) &&
        map.get(objectKey) === undefined &&
        !map.has(stringKey) &&
        map.get(stringKey) === undefined
      );
    }
  }
];

function runTest() {
  act.start();
  if (typeof Map !== 'function') {
    act.fail('The Map built-in object is not implemented on this device');
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
    act.fail('ECMAScript 6 Map set()/has()/get() test failed - see log for details');
  }
}

loadSDK(runTest);
