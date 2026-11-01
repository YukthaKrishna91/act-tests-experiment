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

function func(phrase) {
  return phrase + ', ' + this.firstName;
}

function bindingFunctionTest() {
  var expected = 'Hello, John';
  var output = '';
  var user = {
    firstName: 'John'
  };

  try {
    // bind this to user
    var funcUser = func.bind(user);
    // Hello, John (argument "Hello" is passed, and this=user)
    output = funcUser('Hello');
  } catch (e) {
    output = '';
    act.error('Unexpected error: ' + (e && e.message) || 'unknown');
  }

  return output === expected;
}

function runTest() {
  act.start();
  try {
    bindingFunctionTest() ? act.success() : act.fail(`func.bind() failed to work as expected`);
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
