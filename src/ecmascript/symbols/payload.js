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
    description: 'Symbol constructor',
    run: function () {
      var symbolA = Symbol();
      var symbolB = Symbol('foo');
      return (
        typeof symbolA === 'symbol' &&
        typeof symbolB === 'symbol' &&
        typeof symbolA.description === 'undefined' &&
        symbolB.description === 'foo' &&
        symbolB !== Symbol('foo')
      );
    }
  },
  {
    description: 'Symbol as Object key',
    run: function () {
      var symbol = Symbol();
      var obj = {};
      obj[symbol] = 'value';
      return obj[symbol] === 'value';
    }
  },
  {
    description: 'Symbol.hasInstance',
    run: function () {
      function ArrayFn() {}
      Object.defineProperty(ArrayFn, Symbol.hasInstance, {
        value: function (instance) {
          return Array.isArray(instance);
        }
      });
      return [] instanceof ArrayFn && !({} instanceof ArrayFn);
    }
  },
  {
    description: 'Symbol.isConcatSpreadable',
    run: function () {
      var a = ['a', 'b', 'c'];
      var b = [1, 2, 3];

      var concatSpreadable = a.concat(b);
      b[Symbol.isConcatSpreadable] = false;
      var notConcatSpreadable = a.concat(b);

      return concatSpreadable.length === 6 && notConcatSpreadable.length === 4;
    }
  },
  {
    description: 'Symbol.match',
    run: function () {
      var regEx = /abc/;
      try {
        '/abc/'.startsWith(regEx);
        act.log(['Symbol.match failed', 'String.prototype.startsWith() did not error as expected']);
        return false;
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        /* Do nothing as we expect an exception here. Once
          `regEx[Symbol.match] = false` is executed the same
          call to `'/abc/'.startsWith(regEx)` should not error.
        */
      }
      regEx[Symbol.match] = false;
      return '/abc/'.startsWith(regEx) && !'/def/'.startsWith(regEx);
    }
  },
  {
    description: 'Symbol.replace',
    run: function () {
      function Replacer() {}
      Object.defineProperty(Replacer.prototype, Symbol.replace, {
        value: function (string) {
          return 's/' + string + '/def/g';
        }
      });
      return 'abc'.replace(new Replacer()) === 's/abc/def/g';
    }
  },
  {
    description: 'Symbol.search',
    run: function () {
      function FindA() {}
      Object.defineProperty(FindA.prototype, Symbol.search, {
        value: function (string) {
          var indexOfA = string.indexOf('a');
          if (indexOfA === -1) {
            return 'a is not present';
          }
          return 'a is present at position ' + indexOfA;
        }
      });
      var finder = new FindA();
      return (
        'foobar'.search(finder) === 'a is present at position 4' &&
        'foooof'.search(finder) === 'a is not present'
      );
    }
  },
  {
    description: 'Symbol.split',
    run: function () {
      function AddSlashAfterFirstCharacter() {}
      Object.defineProperty(AddSlashAfterFirstCharacter.prototype, Symbol.split, {
        value: function (string) {
          return string.substr(0, 1) + '/' + string.substr(1);
        }
      });
      var addSlash = new AddSlashAfterFirstCharacter();
      return 'foo'.split(addSlash) === 'f/oo' && 'b'.split(addSlash) === 'b/';
    }
  },
  {
    description: 'Symbol.toPrimitive',
    run: function () {
      var obj = {};
      obj[Symbol.toPrimitive] = function (hint) {
        if (hint === 'number') {
          return 5;
        }
        if (hint === 'string') {
          return 'abcdef';
        }
        return 'default';
      };
      return Number(obj) === 5 && String(obj) === 'abcdef' && obj + '' === 'default';
    }
  },
  {
    description: 'Symbol.for()',
    run: function () {
      return Symbol.for('foo') === Symbol.for('foo');
    }
  },
  {
    description: 'Symbol.keyFor()',
    run: function () {
      var globalSymbol = Symbol.for('foo');
      var localSymbol = Symbol('bar');
      return (
        Symbol.keyFor(globalSymbol) === 'foo' && typeof Symbol.keyFor(localSymbol) === 'undefined'
      );
    }
  },
  {
    description: 'Symbol.prototype.toString()',
    run: function () {
      return Symbol().toString() === 'Symbol()' && Symbol('foo').toString() === 'Symbol(foo)';
    }
  },
  {
    description: 'Symbol.prototype.valueOf()',
    run: function () {
      var symbolA = Symbol();
      var symbolB = Symbol();
      return symbolA === symbolA.valueOf() && symbolA !== symbolB.valueOf();
    }
  }
];

var testsUsingEs6Syntax = [
  {
    description: 'Symbol.iterator',
    test: `(function(){
        const iterable = {
          *[Symbol.iterator]() {
            yield 'a'
            yield 'b'
            yield 'c'
          }
        }
        var result = ''
        for (var letter of iterable) {
          result += letter + '-'
        }
        return result === 'a-b-c-'
      })()
    `
  },
  {
    description: 'Symbol.species',
    test: `(function(){
        class ExtendedArray extends Array {
          static get [Symbol.species]() {
            return Array
          }
        }
        var extendedArray = new ExtendedArray()
        var mappedExtendedArray = extendedArray.map(function() {})
        return mappedExtendedArray instanceof Array
      })()
    `
  },
  {
    description: 'Symbol.toStringTag',
    test: `(function(){
        class MyClass {
          get [Symbol.toStringTag]() {
            return 'MyClassAsAString'
          }
        }
        var myClass = new MyClass()
        return myClass.toString() === '[object MyClassAsAString]'
      })()
    `
  }
];

function runTest() {
  act.start();

  if (typeof Symbol === 'undefined') {
    act.fail('The Symbol API is not implemented on this device');
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
    act.fail('ECMAScript 6 Symbol test failed - see log for details');
  }
}

loadSDK(runTest);
