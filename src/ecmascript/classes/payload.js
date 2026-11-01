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
    description: 'very simple class',
    test: `(function() {
        class Foo {}
        var foo = new Foo()
        return foo instanceof Foo
      })()
    `
  },
  {
    description: 'class assigned to variable',
    test: `(function() {
        var foo = class Foo {}
        var fooInstance = new foo()
        return foo.name === 'Foo' && fooInstance instanceof foo
      })()
    `
  },
  {
    description: 'class with public fields',
    test: `(function() {
        class Foo {
          constructor(a, b) {
            this.a = a
            this.b = b
          }
        }
        var foo = new Foo(3,5)
        return foo.a === 3 && foo.b === 5
      })()
    `
  },
  {
    description: 'class with public method',
    test: `(function() {
        class Dog {
          constructor(name) {
            this.name = name
          }
          bark() {
            return 'woof woof, my name is ' + this.name + ', woof woof'
          }
        }
        var dog = new Dog('Dora')
        return dog.bark() === 'woof woof, my name is Dora, woof woof'
      })()
    `
  },
  {
    description: 'class with public static method',
    test: `(function() {
        class Dog {
          constructor (name) {
            this.name = name
          }
          static giveMeADogCalledDora() {
            return new Dog('Dora')
          }
        }
        var dog = Dog.giveMeADogCalledDora()
        return dog instanceof Dog && dog.name === 'Dora'
      })()
    `
  },
  {
    description: 'class with getter and setter methods',
    test: `(function() {
        class Foo {
          set number(newNumber) {
            this.numberField = newNumber
          }
          get numberSquared () {
            return this.numberField * this.numberField
          }
        }
        var foo = new Foo()
        foo.number = 3
        return foo.numberSquared === 9
      })()
    `
  },
  {
    description: 'class with generator method',
    test: `(function() {
        class Foo {
          *letterGenerator() {
            yield 'a'
            yield 'b'
            yield 'c'
          }
        }
        var foo = new Foo()
        var testString = ''
        for(var letter of foo.letterGenerator()) {
          testString += letter
        }
        return testString === 'abc'
      })()
    `
  }
];

function runTest() {
  act.start();
  var anyFailures = false;

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    try {
      var success = eval(test.test);
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
    act.fail('ECMAScript 6 classes test failed - see log for details');
  }
}

loadSDK(runTest);
