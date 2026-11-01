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
    description: 'str.startsWith(str, index): Returns true if a string starts with the correct str',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return stringToTest.startsWith('This');
    }
  },

  {
    description:
      'str.startsWith(str, index): Returns false if a string does not start with the correct str',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return !stringToTest.startsWith('test');
    }
  },

  {
    description: 'str.startsWith(str, index): Returns false if a string starts in the wrong case.',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return !stringToTest.startsWith('this');
    }
  },

  {
    description:
      'str.startsWith(str, index): Returns true when the specified word is not at the specified index',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return stringToTest.startsWith('the', 8);
    }
  },

  {
    description:
      'str.startsWith(str, index): Returns false when the index number is not in the expected word position',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return !stringToTest.startsWith('the', 10);
    }
  }
];

function runTest() {
  act.start();
  if (typeof String.prototype.startsWith !== 'function') {
    act.fail('String.prototype.startsWith() is not implemented on this device');
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
    act.fail('ECMAScript 6 String.prototype.startsWith() test failed - see log for details');
  }
}

loadSDK(runTest);
