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

function renderNodeList() {
  var listHtml = '<div>A</div><div>B</div><div>C</div><div>D</div><div>E</div>';
  var divElement = document.createElement('div');
  divElement.innerHTML = listHtml;
  divElement.id = 'nodeListParent';
  act.render(divElement);
}

var testsUsingEs5Syntax = [
  {
    description: 'Array from a string',
    run: function () {
      var array = Array.from('xyz');
      return (
        array[0] === 'x' &&
        array[1] === 'y' &&
        array[2] === 'z' &&
        array.length === 3 &&
        Array.isArray(array)
      );
    }
  },
  {
    description: 'Array from a Set',
    run: function () {
      var array = Array.from(new Set(['x', 'y', 'z']));
      return array[0] === 'x' && array[1] === 'y' && array[2] === 'z' && array.length === 3;
    }
  },
  {
    description: 'Array from a Map',
    run: function () {
      var array = Array.from(
        new Map([
          ['a', 'x'],
          ['b', 'y'],
          ['c', 'z']
        ])
      );
      return (
        array[0][0] === 'a' &&
        array[0][1] === 'x' &&
        array[1][0] === 'b' &&
        array[1][1] === 'y' &&
        array[2][0] === 'c' &&
        array[2][1] === 'z' &&
        array.length === 3
      );
    }
  },
  {
    description: 'Array.from() using a map function',
    run: function () {
      var arrayA = [{ x: 'a' }, { x: 'b' }, { x: 'c' }];
      var arrayB = Array.from(arrayA, function (element) {
        return element.x;
      });
      return arrayB[0] === 'a' && arrayB[1] === 'b' && arrayB[2] === 'c' && arrayB.length === 3;
    }
  },
  {
    description: 'Array.from() using a map function with index',
    run: function () {
      var arrayA = [{ x: 'a' }, { x: 'b' }, { x: 'c' }];
      var arrayB = Array.from(arrayA, function (element, index) {
        return element.x + String(index);
      });
      return arrayB[0] === 'a0' && arrayB[1] === 'b1' && arrayB[2] === 'c2' && arrayB.length === 3;
    }
  },
  {
    description: 'Array.from() using a map function and thisArg',
    run: function () {
      var ThisObject = function () {
        this.i = 10;
        this.incrementAndGetI = function () {
          this.i++;
          return this.i;
        };
      };
      var thisObject = new ThisObject();
      var arrayA = [{ x: 'a' }, { x: 'b' }, { x: 'c' }];
      var arrayB = Array.from(
        arrayA,
        function (element) {
          return element.x + String(this.incrementAndGetI());
        },
        thisObject
      );
      return (
        arrayB[0] === 'a11' && arrayB[1] === 'b12' && arrayB[2] === 'c13' && arrayB.length === 3
      );
    }
  }
];

var testsUsingEs6Syntax = [
  {
    description: 'Array from a generator',
    test: `(function(){
        function *generatorFn() {
          yield 'x'
          yield 'y'
          yield 'z'
        }
        var array = Array.from(generatorFn())
        return array[0] === 'x' && array[1] === 'y' &&
          array[2] === 'z' && array.length === 3
      })()
    `
  },
  {
    description: 'Array.from() with a mapping arrow function',
    test: `(function(){
        var arrayA = [{ x: 'a' }, { x: 'b' }, { x: 'c' }]
        var arrayB = Array.from(arrayA, element => element.x)
        return arrayB[0] === 'a' && arrayB[1] === 'b' &&
          arrayB[2] === 'c' && arrayB.length === 3
      })()
    `
  },
  {
    description: 'Array.from() with a mapping arrow function using indexes',
    test: `(function(){
        var arrayA = [{ x: 'a' }, { x: 'b' }, { x: 'c' }]
        var arrayB = Array.from(arrayA, (element, index) => element.x + String(index))
        return arrayB[0] === 'a0' && arrayB[1] === 'b1' &&
          arrayB[2] === 'c2' && arrayB.length === 3
      })()
    `
  }
];

function runTest() {
  act.start();
  if (typeof Array.from !== 'function') {
    act.fail('Array.from() is not implemented on this device');
    return;
  }

  renderNodeList();

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
    act.fail('ECMAScript 6 Array.from() test failed - see log for details');
  }
}

loadSDK(runTest);
