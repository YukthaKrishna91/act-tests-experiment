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
      'The str.includes method returns true if the string contains the given word anywhere within the string.',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return stringToTest.includes('test');
    }
  },

  {
    description:
      'The str.includes(str, index): Returns false if the given word is not included in the given string',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return !stringToTest.includes('cat');
    }
  },

  {
    description:
      'str.includes(str, index): Returns true when the specified word is at the specified index',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return stringToTest.includes('to', 34);
    }
  },

  {
    description:
      'str.includes, index): Returns false when the specified word is not at the specified index',
    run: function () {
      var stringToTest = 'This is the string that I am going to test';
      return !stringToTest.includes('is', 10);
    }
  }
];

function runTest() {
  act.start();
  if (typeof String.prototype.includes !== 'function') {
    act.fail('String.prototype.includes() is not implemented on this device');
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
    act.fail('ECMAScript 6 String.prototype.includes() test failed - see log for details');
  }
}

loadSDK(runTest);
