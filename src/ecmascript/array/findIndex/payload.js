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

var testsUsingEs5Syntax = [
  {
    description: 'Array.prototype.findIndex() with simple callback function',
    run: function () {
      var array = ['a', 'b', 'c', 'd', 'e', 'd'];
      var result = array.findIndex(function (element) {
        return element === 'd';
      });
      return result === 3;
    }
  },
  {
    description: 'Array.prototype.findIndex() where no index is found',
    run: function () {
      var array = ['a', 'b', 'c', 'd', 'e'];
      var result = array.findIndex(function (element) {
        return element === 'x';
      });
      return result === -1;
    }
  },
  {
    description: 'Array.prototype.findIndex() with callback function using index',
    run: function () {
      var array = [3, 4, 2, 5, 6];
      var result = array.findIndex(function (element, index) {
        return element === index;
      });
      return result === 2;
    }
  },
  {
    description: 'Array.prototype.findIndex() with callback function using array',
    run: function () {
      var arrayA = [3, 4, 2, 5, 6];
      var result = arrayA.findIndex(function (element, index, arrayB) {
        return element === arrayB.length;
      });
      return result === 3;
    }
  },
  {
    description: 'Array.prototype.findIndex() with callback function and thisArg',
    run: function () {
      var arrayA = ['a', 'b', 'c', 'd', 'e'];
      var ThisObject = function () {
        this.target = 'c';
      };
      var thisObject = new ThisObject();
      var result = arrayA.findIndex(function (element) {
        return element === this.target;
      }, thisObject);
      return result === 2;
    }
  }
];

var testsUsingEs6Syntax = [
  {
    description: 'Array.prototype.findIndex() with arrow function',
    test: `(function () {
        var array = ['a', 'b', 'c', 'd', 'e', 'd']
        var result = array.findIndex(element => element === 'd')
        return result === 3
      })()`
  },
  {
    description: 'Array.prototype.findIndex() with arrow function using index',
    test: `(function () {
        var array = [3, 4, 2, 5, 6]
        var result = array.findIndex((element, index) => element === index)
        return result === 2
      })()`
  },
  {
    description: 'Array.prototype.findIndex() with arrow function using array',
    test: `(function () {
        var arrayA = [3, 4, 2, 5, 6]
        var result = arrayA.findIndex((element, index, arrayB) => element === arrayB.length)
        return result === 3
      })()`
  }
];

function runTest() {
  act.start();
  if (typeof Array.prototype.findIndex !== 'function') {
    act.fail('Array.prototype.findIndex() is not implemented on this device');
    return;
  }

  var anyFailures = false;
  var test, success;

  for (var i = 0; i < testsUsingEs5Syntax.length; i++) {
    test = testsUsingEs5Syntax[i];

    try {
      success = test.run();
      if (!success) {
        act.log(test.description + ' test failed');
        anyFailures = true;
      }
    } catch (error) {
      act.log([test.description + ' test failed with error', error.message]);
      anyFailures = true;
    }
  }

  for (var j = 0; j < testsUsingEs6Syntax.length; j++) {
    test = testsUsingEs6Syntax[j];

    try {
      success = eval(test.test);
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
    act.fail('ECMAScript 6 array.prototype.findIndex test failed - see log for details');
  }
}

loadSDK(runTest);
