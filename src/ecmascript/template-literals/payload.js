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

function formatErrorMessage(description, expected, error) {
  return (
    description +
    ' test did not return expected value (' +
    expected +
    ') instead got (' +
    error +
    ')'
  );
}

function testTemplateLiterals() {
  var output = {
    status: true,
    reason: []
  };

  var testCases = [
    {
      description: 'untagged single line template literal',
      expectedResult: 'First some letters: abcde then some numbers: 12345 then both: abcde12345',
      test: [
        'function testUntaggedSingleLineTemplateLiteral () {',
        '  var letters = "ABCDE";',
        '  var objectWithNumbers = { numbers: 12345 };',
        '   return `First some letters: ${letters.toLowerCase()} then some numbers: ${objectWithNumbers.numbers} then both: ${letters.toLowerCase() + objectWithNumbers.numbers}`',
        ' }',
        ' testUntaggedSingleLineTemplateLiteral()'
      ].join('\n')
    },
    {
      description: 'untagged multiline template literal',
      expectedResult: 'First some letters: abcde\nthen some numbers: 12345\nthen both: abcde12345',
      test: [
        'function testUntaggedMultilineTemplateLiteral () {',
        '  var letters = "ABCDE";',
        '  var objectWithNumbers = { numbers: 12345 };',
        '   return `First some letters: ${letters.toLowerCase()}',
        'then some numbers: ${objectWithNumbers.numbers}',
        'then both: ${letters.toLowerCase() + objectWithNumbers.numbers}`',
        ' }',
        ' testUntaggedMultilineTemplateLiteral()'
      ].join('\n')
    },
    {
      description: 'untagged nested template literal',
      expectedResult: 'Gets true then false: true then false',
      test: [
        'function returnsTrue () {',
        '  return true;',
        '}',
        'function returnsFalse () {',
        '  return false;',
        '}',
        'function testUntaggedNestedTemplateLiteral () {',
        '   return `Gets true then false: ${ returnsTrue() ? `${ returnsFalse() ? "unexpected true on second check" : "true then false" }` : "unexpected false on first check" }`',
        ' }',
        ' testUntaggedNestedTemplateLiteral()'
      ].join('\n')
    },
    {
      description: 'tagged template literal',
      expectedResult: 'First some letters:  then some numbers: abcde12345',
      test: [
        'function mangleTaggedFunctionArguments () {',
        '  var templateStrings = arguments[0];',
        '  var valueArguments = Array.prototype.slice.call(arguments, 1);',
        '  return templateStrings.join("") + valueArguments.join("");',
        ' }',
        'function testTaggedTemplateLiteral () {',
        '  var letters = "abcde";',
        '  var objectWithNumbers = { numbers: 12345 };',
        '  return mangleTaggedFunctionArguments`First some letters: ${letters} then some numbers: ${objectWithNumbers.numbers}`;',
        ' }',
        ' testTaggedTemplateLiteral()'
      ].join('\n')
    }
  ];

  do {
    var test = testCases.pop();
    var actual, outcome;
    var error = '';
    try {
      actual = eval(test.test);
      outcome = test.expectedResult === actual;
    } catch (e) {
      error = 'Device does not support ' + test.description;
      act.log([error, e.message]);
      outcome = false;
    } finally {
      if (outcome !== true) {
        output.status = false;
        act.log(formatErrorMessage(test.description, test.expectedResult, error || actual));
      }
    }
  } while (testCases.length);

  return output;
}

function runTest() {
  act.start();
  var testOutcome = testTemplateLiterals();
  if (testOutcome.status) {
    act.success();
  } else {
    act.fail('ECMAScript 6 template literals test failed - see log for details');
  }
}

loadSDK(runTest);
