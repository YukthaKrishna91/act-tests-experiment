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
    description: 'simple class inheritance',
    test: `(function() {
        class Animal {
          constructor(species) {
            this.species = species
          }
          sayHello() {
            return 'Hello, I am a ' + this.species
          }
          talk() {
            return 'generic animal noise'
          }
        }
        class Dog extends Animal {
          constructor(breed) {
            super('dog')
            this.breed = breed
          }
          talk() {
            return 'woof woof'
          }
        }
        var dog = new Dog('German Shepherd')
        return dog.breed === 'German Shepherd' && dog.species === 'dog'
          && dog.sayHello() === 'Hello, I am a dog'
          && dog.talk() === 'woof woof'
      })()
    `
  },
  {
    description: 'extending traditional function-based "classes"',
    test: `(function() {
        function Animal (species) {
          this.species = species
        }
        Animal.prototype.sayHello = function() {
          return 'Hello, I am a ' + this.species
        }
        Animal.prototype.talk = function() {
          return 'generic animal noise'
        }
        class Dog extends Animal {
          constructor(breed) {
            super('dog')
            this.breed = breed
          }
          talk() {
            return 'woof woof'
          }
        }
        var dog = new Dog('German Shepherd')
        return dog.breed === 'German Shepherd' && dog.species === 'dog'
          && dog.sayHello() === 'Hello, I am a dog'
          && dog.talk() === 'woof woof'
      })()
    `
  },
  {
    description: 'super class calls with `super`',
    test: `(function() {
        class Animal {
          constructor(species) {
            this.species = species
          }
          sayHello() {
            return 'hello, I am a ' + this.species
          }
        }
        class Dog extends Animal {
          constructor () {
            super('dog')
          }
          sayHello() {
            return 'woof woof, ' + super.sayHello()
          }
        }
        var dog = new Dog()
        return dog.sayHello() === 'woof woof, hello, I am a dog'
      })()
    `
  },
  {
    description: 'mixins as templates for classes',
    test: `(function() {
        let helloMixin = function (Base) {
          return class extends Base {
            sayHello() {
              return 'hello'
            }
          }
        }
        class Foo {}
        class Bar extends helloMixin(Foo) {}
        var bar = new Bar()
        return bar.sayHello() === 'hello'
      })()
    `
  },
  {
    description: 'extending built-in objects',
    test: `(function() {
        class CustomError extends Error {
          constructor (message) {
            super(message)
            this.name = 'Custom Error'
          }
        }
        try {
          throw new CustomError('custom error test')
        } catch (error) {
          return error.message === 'custom error test'
            && error.name === 'Custom Error'
        }
      })()
    `
  },
  {
    description: 'inheritance of static methods',
    test: `(function() {
        class Foo {
          static fooStaticMethod() {
            return 'foo static method output'
          }
        }
        class Bar extends Foo {}
        return Bar.fooStaticMethod() === 'foo static method output'
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
    act.fail('ECMAScript 6 class inheritance test failed - see log for details');
  }
}

loadSDK(runTest);
