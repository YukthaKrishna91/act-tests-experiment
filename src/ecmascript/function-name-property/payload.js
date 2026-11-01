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
    description: 'Named Function',
    run: function () {
      function foo() {}
      return foo.name === 'foo';
    }
  },
  {
    description: 'Function assigned to a variable',
    run: function () {
      var foo = function () {};
      return foo.name === 'foo';
    }
  },
  {
    description: 'Function as an object key',
    run: function () {
      var obj = {
        foo: function () {}
      };
      return obj.foo.name === 'foo';
    }
  },
  {
    description: 'Anonymous function expression',
    run: function () {
      return function () {}.name === '';
    }
  },
  {
    description: 'Bound function names',
    run: function () {
      function foo() {}
      return foo.bind({}).name === 'bound foo';
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
    act.fail('ECMAScript 6 function name property test failed - see log for details');
  }
}

loadSDK(runTest);
