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
    description: 'proxy get',
    run: function () {
      var target = {
        foo: 'foo in target'
      };
      var proxy = new Proxy(target, {
        get: function (target, prop) {
          return typeof target[prop] !== 'undefined' ? target[prop] : prop + ' not in target';
        }
      });
      return proxy['foo'] === 'foo in target' && proxy['bar'] === 'bar not in target';
    }
  },
  {
    description: 'proxy set',
    run: function () {
      var target = {};

      var proxy = new Proxy(target, {
        set: function (target, prop, value) {
          target[prop] = value.toUpperCase();
          return true;
        }
      });
      proxy['foo'] = 'abc';
      return proxy['foo'] === 'ABC' && target['foo'] === 'ABC';
    }
  },
  {
    description: 'no-op forwarding proxy',
    run: function () {
      var target = { foo: 'bar' };

      var proxy = new Proxy(target, {});

      return proxy.foo === 'bar' && typeof proxy.baz === 'undefined';
    }
  },
  {
    description: 'proxy constructor',
    run: function () {
      var Target = function (a) {
        this.a = a;
      };
      var ProxyTarget = new Proxy(Target, {
        construct: function (Target, params) {
          var obj = new Target(params[0]);
          obj.b = params[1];
          return obj;
        }
      });
      var test = new ProxyTarget('AAA', 'BBB');
      return test.a === 'AAA' && test.b === 'BBB';
    }
  }
];

function runTest() {
  act.start();
  if (typeof Proxy === 'undefined') {
    act.fail('The Proxy API is not implemented on this device');
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
    act.fail('ECMAScript 6 proxying test failed - see log for details');
  }
}

loadSDK(runTest);
