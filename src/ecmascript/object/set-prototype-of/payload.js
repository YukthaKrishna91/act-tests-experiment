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
    description: 'Object.setPrototypeOf() can add a prototype to an object.',
    run: function () {
      var ancestor = {
        ancestorProperty: 'Justified and ancient'
      };
      function Descendant() {}

      var aDescendant = new Descendant();
      Object.setPrototypeOf(aDescendant, ancestor);
      return aDescendant.ancestorProperty === 'Justified and ancient';
    }
  },
  {
    description: 'Object.setPrototypeOf() can remove a prototype from an object.',
    run: function () {
      var anArray = [1, 2, 3];
      Object.setPrototypeOf(anArray, null);
      return anArray.indexOf === undefined;
    }
  },
  {
    description: 'Object.setPrototypeOf() returns the object it is called on.',
    run: function () {
      var ancestor = {
        ancestorProperty: 'Justified and ancient'
      };
      function Descendant() {}

      var aDescendant = new Descendant();
      return aDescendant === Object.setPrototypeOf(aDescendant, ancestor);
    }
  }
];

function runTest() {
  act.start();
  if (typeof Object.setPrototypeOf !== 'function') {
    act.fail('Object.setPrototypeOf() is not implemented on this device');
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
    act.fail('ECMAScript 6 Object.setPrototypeOf() test failed - see log for details');
  }
}

loadSDK(runTest);
