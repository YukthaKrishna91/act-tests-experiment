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
    description: 'Objects are extensible by default',
    run: function () {
      var empty = {};
      return Object.isExtensible(empty);
    }
  },
  {
    description:
      'Object.isExtensible() returns false for an object if Object.preventExtensions() is called on the same object',
    run: function () {
      var empty = {};
      Object.preventExtensions(empty);
      return !Object.isExtensible(empty);
    }
  },
  {
    description: 'Object.preventExtensions() returns the original object',
    run: function () {
      var empty = {};
      return empty === Object.preventExtensions(empty);
    }
  },
  {
    description: 'A non-extensible object can have its property values changed directly',
    run: function () {
      var nonExtensible = {
        firstProperty: 'hello',
        secondProperty: 'world'
      };
      Object.preventExtensions(nonExtensible);
      nonExtensible.secondProperty = 'universe';
      return nonExtensible.secondProperty === 'universe';
    }
  },
  {
    description:
      'A non-extensible object can have its property values changed via Object.defineProperty()',
    run: function () {
      var nonExtensible = {
        firstProperty: 'hello',
        secondProperty: 'world'
      };
      Object.preventExtensions(nonExtensible);
      Object.defineProperty(nonExtensible, 'secondProperty', {
        value: 'universe',
        writable: false
      });
      return nonExtensible.secondProperty === 'universe';
    }
  },
  {
    description: 'A non-extensible object can not have properties added directly',
    run: function () {
      var nonExtensible = {
        property: 'hello'
      };
      Object.preventExtensions(nonExtensible);
      try {
        nonExtensible.newProperty = 'I will not be added';
        act.log('Expected a TypeError when trying to add a property directly');
        return false;
      } catch (e) {
        if (e instanceof TypeError) {
          return true;
        } else {
          act.log('Expected a TypeError, but got ' + e);
          return false;
        }
      }
    }
  },
  {
    description:
      'A non-extensible object can not have properties added via Object.defineProperty()',
    run: function () {
      var nonExtensible = {
        property: 'hello'
      };
      Object.preventExtensions(nonExtensible);
      try {
        Object.defineProperty(nonExtensible, 'newProperty', {
          value: 'I will not be added',
          writable: false
        });
        act.log('Expected a TypeError when trying to add a property via Object.defineProperty()');
        return false;
      } catch (e) {
        if (e instanceof TypeError) {
          return true;
        } else {
          act.log('Expected a TypeError, but got ' + e);
          return false;
        }
      }
    }
  },
  {
    description: 'A non-extensible object can have properties deleted',
    run: function () {
      var nonExtensible = {
        property: 'hello'
      };
      Object.preventExtensions(nonExtensible);
      delete nonExtensible.property;
      return undefined === nonExtensible.property;
    }
  },
  {
    description: 'A non-extensible object with no properties is frozen',
    run: function () {
      var empty = {};
      Object.preventExtensions(empty);
      return Object.isFrozen(empty);
    }
  },
  {
    description:
      'A non-extensible object with properties is not frozen, as the property can be deleted, is still configurable and writable',
    run: function () {
      var nonExtensible = {
        property: 'hello'
      };
      Object.preventExtensions(nonExtensible);
      return !Object.isFrozen(nonExtensible);
    }
  },
  {
    description: 'A non-extensible object with all properties deleted is frozen',
    run: function () {
      var nonExtensible = {
        property: 'hello'
      };
      Object.preventExtensions(nonExtensible);
      delete nonExtensible.property;
      return Object.isFrozen(nonExtensible);
    }
  },
  {
    description: 'A non-extensible object can not have its prototype changed',
    run: function () {
      var nonExtensible = {
        property: 'hello'
      };
      Object.preventExtensions(nonExtensible);
      try {
        Object.setPrototypeOf(nonExtensible, {});
        act.log(
          'Expected a TypeError when trying to change the prototype of a non-extensible object'
        );
        return false;
      } catch (e) {
        if (e instanceof TypeError) {
          return true;
        } else {
          act.log('Expected a TypeError, but got ' + e);
          return false;
        }
      }
    }
  },
  {
    description: 'Objects are not sealed by default',
    run: function () {
      var empty = {};
      return !Object.isSealed(empty);
    }
  },
  {
    description: 'A non-extensible empty object is vacuously sealed',
    run: function () {
      var empty = {};
      Object.preventExtensions(empty);
      return Object.isSealed(empty);
    }
  },
  {
    description:
      'A non-extensible non-empty object is not sealed as its properties are configurable by default',
    run: function () {
      var nonEmpty = {
        firstProperty: 'hello',
        secondProperty: 'world'
      };
      Object.preventExtensions(nonEmpty);
      return !Object.isSealed(nonEmpty);
    }
  },
  {
    description:
      'A non-extensible non-empty object is not sealed if any properties are non-configurable',
    run: function () {
      var nonEmpty = {
        firstProperty: 'hello',
        secondProperty: 'world'
      };
      Object.preventExtensions(nonEmpty);
      Object.defineProperty(nonEmpty, 'firstProperty', {
        configurable: false
      });
      return !Object.isSealed(nonEmpty);
    }
  },
  {
    description:
      'A non-extensible non-empty object is sealed when its properties are all non-configurable',
    run: function () {
      var nonEmpty = {
        firstProperty: 'hello',
        secondProperty: 'world'
      };
      Object.preventExtensions(nonEmpty);
      Object.defineProperty(nonEmpty, 'firstProperty', {
        configurable: false
      });
      Object.defineProperty(nonEmpty, 'secondProperty', {
        configurable: false
      });
      return Object.isSealed(nonEmpty);
    }
  },
  {
    description: 'An explicitly sealed object is sealed',
    run: function () {
      var sealed = {
        firstProperty: 'hello',
        secondProperty: 'world'
      };
      Object.seal(sealed);
      return Object.isSealed(sealed);
    }
  },
  {
    description: 'Object.seal() returns the original object',
    run: function () {
      var sealed = {
        firstProperty: 'hello',
        secondProperty: 'world'
      };
      return sealed === Object.seal(sealed);
    }
  },
  {
    description: 'A sealed object can have its property values changed directly',
    run: function () {
      var sealed = {
        firstProperty: 'hello',
        secondProperty: 'world'
      };
      Object.seal(sealed);
      sealed.secondProperty = 'universe';
      return sealed.secondProperty === 'universe';
    }
  },
  {
    description: 'A sealed object can have its property values changed via Object.defineProperty()',
    run: function () {
      var sealed = {
        firstProperty: 'hello',
        secondProperty: 'world'
      };
      Object.seal(sealed);
      Object.defineProperty(sealed, 'secondProperty', {
        value: 'universe',
        writable: false
      });
      return sealed.secondProperty === 'universe';
    }
  },
  {
    description: 'A sealed object can not have properties added directly',
    run: function () {
      var sealed = {
        property: 'hello'
      };
      Object.seal(sealed);
      try {
        sealed.newProperty = 'I will not be added';
        act.log('Expected a TypeError when trying to add a property directly');
        return false;
      } catch (e) {
        if (e instanceof TypeError) {
          return true;
        } else {
          act.log('Expected a TypeError, but got ' + e);
          return false;
        }
      }
    }
  },
  {
    description: 'A sealed object can not have properties added via Object.defineProperty()',
    run: function () {
      var sealed = {
        property: 'hello'
      };
      Object.seal(sealed);
      try {
        Object.defineProperty(sealed, 'newProperty', {
          value: 'I will not be added',
          writable: false
        });
        act.log('Expected a TypeError when trying to add a property via Object.defineProperty()');
        return false;
      } catch (e) {
        if (e instanceof TypeError) {
          return true;
        } else {
          act.log('Expected a TypeError, but got ' + e);
          return false;
        }
      }
    }
  },
  {
    description: 'A sealed object can not have properties deleted',
    run: function () {
      var sealed = {
        property: 'hello'
      };
      Object.seal(sealed);
      try {
        delete sealed.property;
        act.log('Expected a TypeError when trying to delete a property');
        return false;
      } catch (e) {
        if (e instanceof TypeError) {
          return true;
        } else {
          throw new Error('Expected a TypeError, but got a ' + e);
        }
      }
    }
  },
  {
    description: 'A sealed object can not have its properties changed to accessors',
    run: function () {
      var sealed = {
        property: 'hello'
      };
      Object.seal(sealed);
      try {
        Object.defineProperty(sealed, 'property', {
          get: function () {
            return 'look ma, I`m an accessor';
          }
        });
        act.log('Expected a TypeError when trying to change a property to an accessor');
        return false;
      } catch (e) {
        if (e instanceof TypeError) {
          return true;
        } else {
          act.log('Expected a TypeError, but got ' + e);
          return false;
        }
      }
    }
  },
  {
    description: 'A sealed object can not have its accessors changed to properties',
    run: function () {
      var sealed = {
        get property() {
          return 'I am an accessor';
        }
      };
      Object.seal(sealed);
      try {
        Object.defineProperty(sealed, 'property', {
          value: 123,
          writable: false
        });
        act.log('Expected a TypeError when trying to change an accessor to a property');
        return false;
      } catch (e) {
        if (e instanceof TypeError) {
          return true;
        } else {
          act.log('Expected a TypeError, but got ' + e);
          return false;
        }
      }
    }
  },
  {
    description: 'An explicitly sealed object is non-extensible',
    run: function () {
      var sealed = {
        firstProperty: 'hello',
        secondProperty: 'world'
      };
      Object.seal(sealed);
      return !Object.isExtensible(sealed);
    }
  },
  {
    description: 'An explicitly sealed object with no writable properties is frozen',
    run: function () {
      var empty = {};
      Object.seal(empty);
      return Object.isFrozen(empty);
    }
  },
  {
    description: 'An explicitly sealed object with a writable property is not frozen',
    run: function () {
      var nonEmptyWithWritable = { writableProperty: 'you could change me' };
      Object.seal(nonEmptyWithWritable);
      return !Object.isFrozen(nonEmptyWithWritable);
    }
  },
  {
    description:
      'An explicitly sealed object with writable and non-writable properties is not frozen',
    run: function () {
      var nonEmptyWithWritableAndNonWritable = {
        writableProperty: 'you could change me',
        get nonWritableProperty() {
          return "but you can't change me";
        }
      };
      Object.seal(nonEmptyWithWritableAndNonWritable);
      return !Object.isFrozen(nonEmptyWithWritableAndNonWritable);
    }
  },
  {
    description: 'An explicitly sealed object with only non-writable properties is frozen',
    run: function () {
      var nonEmptyWithNonWritable = {
        get nonFirstWritableProperty() {
          return "can't change me";
        },
        get nonSecondWritableProperty() {
          return 'or me';
        }
      };
      Object.seal(nonEmptyWithNonWritable);
      return Object.isFrozen(nonEmptyWithNonWritable);
    }
  },
  {
    description: 'Objects are extensible, so not frozen by default',
    run: function () {
      return !Object.isFrozen({});
    }
  },
  {
    description: 'A new object with one property is also extensible, ergo not frozen',
    run: function () {
      var singleProp = { p: 42 };
      return !Object.isFrozen(singleProp);
    }
  },
  {
    description: 'A frozen object is frozen',
    run: function () {
      var frozen = {};
      Object.freeze(frozen);
      return Object.isFrozen(frozen);
    }
  },
  {
    description: 'A frozen object is sealed',
    run: function () {
      var frozen = {};
      Object.freeze(frozen);
      return Object.isSealed(frozen);
    }
  },
  {
    description: 'A frozen object is non-extensible',
    run: function () {
      var frozen = {};
      Object.freeze(frozen);
      return !Object.isExtensible(frozen);
    }
  },
  {
    description:
      'A non-extensible object with a non-writable but configurable property is not frozen',
    run: function () {
      var nonExtensible = { nonWritable: 'I will not be writable, but will be configurable' };
      Object.preventExtensions(nonExtensible);
      Object.defineProperty(nonExtensible, 'nonWritable', {
        writable: false
      });
      return !Object.isFrozen(nonExtensible);
    }
  },
  {
    description:
      'A non-extensible object with a non-configurable but writable property is not frozen',
    run: function () {
      var nonExtensible = { nonConfigurable: 'I will not be configurable, but will be writable' };
      Object.preventExtensions(nonExtensible);
      Object.defineProperty(nonExtensible, 'nonConfigurable', {
        configurable: false
      });
      return !Object.isFrozen(nonExtensible);
    }
  },
  {
    description:
      'A non-extensible object with a non-writable and non-configurable property is frozen',
    run: function () {
      var nonExtensible = { nonWritableOrConfigurable: 'I will not be writable or configurable' };
      Object.preventExtensions(nonExtensible);
      Object.defineProperty(nonExtensible, 'nonWritableOrConfigurable', {
        writable: false,
        configurable: false
      });
      return Object.isFrozen(nonExtensible);
    }
  },
  {
    description: 'A non-extensible object with a configurable accessor property is not frozen',
    run: function () {
      var nonExtensible = {
        get configurableAccessor() {
          return 'You could configure me';
        }
      };
      Object.preventExtensions(nonExtensible);
      return !Object.isFrozen(nonExtensible);
    }
  },
  {
    description: 'A non-extensible object with a non-configurable accessor property is frozen',
    run: function () {
      var nonExtensible = {
        get nonConfigurableAccessor() {
          return 'You could not configure me';
        }
      };
      Object.preventExtensions(nonExtensible);
      Object.defineProperty(nonExtensible, 'nonConfigurableAccessor', {
        configurable: false
      });
      return Object.isFrozen(nonExtensible);
    }
  }
];

function runTest() {
  act.start();
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
    act.fail(
      'ECMAScript 6 Object extensibility/sealing/freezing test failed - see log for details'
    );
  }
}

loadSDK(runTest);
