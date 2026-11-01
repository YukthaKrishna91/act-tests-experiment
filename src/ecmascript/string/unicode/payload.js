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

var testCases = [
  {
    description: 'Hex escaped string literal',
    test: `
      (function(){
        var test = '\x61bc'
        return test.length === 3 &&
          test === 'abc'
          test[0] === 'a'
      })()
    `
  },
  {
    description: '16-bit Unicode escaped string literal',
    test: `
      (function(){
        var test = 'abc\u0B85def'
        return test.length === 7 &&
          test[2] === 'c' &&
          test[3] === '\u0B85' &&
          test[4] === 'd'
      })()
    `
  },
  {
    description: '16-bit Unicode code point escaped string literal',
    test: `
      (function(){
        var test = 'abc\u{0B85}def'
        return test.length === 7 &&
          test[2] === 'c' &&
          test[3] === '\u{0B85}' &&
          test[4] === 'd'
      })()
    `
  },
  {
    description: '32-bit Unicode code point escaped string literal',
    test: `
      (function(){
        var test = 'abc\u{1D306}def'
        return test.length === 8 &&
          test[2] === 'c' &&
          // Generally, a 32-bit code point value won't decompose into two printable strings when split into the 16-bit code units at each string index
          test[5] === 'd'
      })()
    `
  },
  {
    description: '32-bit Unicode code point escaped string literal',
    test: `
      (function(){
        var test = '\u{1D306}'
        return test === '\uD834\uDF06' &&
          test.length == 2
      })()
    `
  },
  {
    description: 'codePointAt() for an 8-bit code point',
    test: `
      (function(){
        var test = 'A'
        return test.codePointAt(0) === 65
      })()
    `
  },
  {
    description: 'codePointAt() for a 16-bit code point',
    test: `
      (function(){
        var test = '\u0B85'
        return test.codePointAt(0) === 2949
      })()
    `
  },
  {
    description: 'codePointAt() for a 32-bit code point',
    test: `
      (function(){
        var test = '\uD834\uDF06'
        return test.codePointAt(0) === 119558 &&
          test.codePointAt(1) === 57094
      })()
    `
  },
  {
    description: 'Iterating over a string literal returns code points',
    test: `
      (function(){
        var test = 'abc\u{0B85}def'
        var iterationItems = []
        for (var cp of test) {
          iterationItems.push(cp)
        }
        return iterationItems.length === 7 &&
          iterationItems[3] === '\u{0B85}'
      })()
    `
  },
  {
    description: 'Spread operator over a string literal returns code points',
    test: `
      (function(){
        var test = 'abc\u{0B85}def'
        var spread = [...test]
        return spread.length === 7 &&
          spread[3] === '\u{0B85}'
      })()
    `
  }
];

function runTest() {
  act.start();
  var anyFailures = false;
  var test, success;

  for (var i = 0; i < testCases.length; i++) {
    test = testCases[i];

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
    act.fail('ECMAScript 6 Unicode strings test failed - see log for details');
  }
}

loadSDK(runTest);
