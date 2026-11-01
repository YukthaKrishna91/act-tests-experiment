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

var tests = [
  {
    description:
      'The str.endsWith method returns true if the given string exists at the end of the string.',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return stringToTest.endsWith('test');
    }
  },

  {
    description:
      'str.endsWith(str, index): Returns false if a string does not end with the correct str',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return !stringToTest.endsWith('This');
    }
  },

  {
    description:
      'str.endsWith(str, index): Returns false if the matching string has the right letters but in the wrong case',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return !stringToTest.endsWith('Test');
    }
  },

  {
    description:
      'str.endsWith(str, index): Returns false when the specified word is not at the specified index',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return stringToTest.endsWith('string', 18);
    }
  },

  {
    description:
      'str.endsWithstr, index): Returns false when the specified word is not at the specified index',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return !stringToTest.endsWith('test', 10);
    }
  }
];

function runTest() {
  act.start();
  if (typeof String.prototype.endsWith !== 'function') {
    act.fail('String.prototype.endsWith() is not implemented on this device');
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
      act.log([test.description + ' test error', error.message]);
      anyFailures = true;
    }
  }

  if (!anyFailures) {
    act.success();
  } else {
    act.fail('ECMAScript 6 String.prototype.endsWith() test failed - see log for details');
  }
}

loadSDK(runTest);
