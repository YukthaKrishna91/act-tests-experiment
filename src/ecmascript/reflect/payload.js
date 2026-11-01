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
    description: 'Reflect.apply()',
    run: function () {
      return (
        Reflect.apply(String, undefined, [4.99]) === '4.99' &&
        Reflect.apply(''.charAt, 'reflectApi', [7]) === 'A'
      );
    }
  },
  {
    description: 'Reflect.construct()',
    run: function () {
      function productFn(a, b) {
        this.product = a * b;
      }
      var obj = Reflect.construct(productFn, [3, 5]);
      return obj.product === 15;
    }
  },
  {
    description: 'Reflect.defineProperty()',
    run: function () {
      var obj = {};
      Reflect.defineProperty(obj, 'a', { value: 3 });
      return obj.a === 3;
    }
  },
  {
    description: 'Reflect.deleteProperty()',
    run: function () {
      var obj = { a: 10 };
      var arr = ['a', 'b', 'c'];
      Reflect.deleteProperty(obj, 'a');
      Reflect.deleteProperty(arr, 1);
      return (
        typeof obj.a === 'undefined' &&
        arr[0] === 'a' &&
        typeof arr[1] === 'undefined' &&
        arr[2] === 'c'
      );
    }
  },
  {
    description: 'Reflect.get()',
    run: function () {
      var obj = { a: 10 };
      var arr = ['a', 'b', 'c'];
      return (
        Reflect.get(obj, 'a') === 10 &&
        Reflect.get(arr, 2) === 'c' &&
        typeof Reflect.get(obj, 'b') === 'undefined' &&
        typeof Reflect.get(arr, 3) === 'undefined'
      );
    }
  },
  {
    description: 'Reflect.getOwnPropertyDescriptor()',
    run: function () {
      var obj = { a: 10 };
      var a = Reflect.getOwnPropertyDescriptor(obj, 'a');
      return (
        a.value === 10 &&
        a.writable === true &&
        typeof Reflect.getOwnPropertyDescriptor(obj, 'b') === 'undefined'
      );
    }
  },
  {
    description: 'Reflect.getPrototypeOf()',
    run: function () {
      var obj = { a: 10 };
      return typeof Reflect.getPrototypeOf(obj) === 'object';
    }
  },
  {
    description: 'Reflect.has()',
    run: function () {
      var obj = { a: 10 };
      return Reflect.has(obj, 'a') && !Reflect.has(obj, 'b') && Reflect.has(obj, 'toString');
    }
  },
  {
    description: 'Reflect.isExtensible() and Reflect.preventExtensions()',
    run: function () {
      var objA = {};
      var objB = {};
      Reflect.preventExtensions(objB);
      return Reflect.isExtensible(objA) && !Reflect.isExtensible(objB);
    }
  },
  {
    description: 'Reflect.ownKeys()',
    run: function () {
      var obj = { a: 1, b: 2 };
      var objKeys = Reflect.ownKeys(obj);
      return objKeys.indexOf('a') !== -1 && objKeys.indexOf('b') !== -1 && objKeys.length === 2;
    }
  },
  {
    description: 'Reflect.set()',
    run: function () {
      var obj = { a: 1 };
      Reflect.set(obj, 'a', 2);
      Reflect.set(obj, 'b', 5);
      var arr = ['a', 'b', 'c'];
      Reflect.set(arr, 1, 'd');
      return obj.a === 2 && obj.b === 5 && arr[0] === 'a' && arr[1] === 'd' && arr[2] === 'c';
    }
  },
  {
    description: 'Reflect.setPrototypeOf() and Reflect.preventExtensions()',
    run: function () {
      var objA = {};
      var objB = {};
      Reflect.preventExtensions(objB);
      return (
        Reflect.setPrototypeOf(objA, null) === true && Reflect.setPrototypeOf(objB, null) === false
      );
    }
  }
];

function runTest() {
  act.start();
  if (typeof Reflect === 'undefined') {
    act.fail('The Reflect object is not implemented on this device');
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
    act.fail('ECMAScript 6 Reflect test failed - see log for details');
  }
}

loadSDK(runTest);
