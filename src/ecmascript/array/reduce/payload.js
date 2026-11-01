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

function arrayReduceFunctionTestTwoParam() {
  var numbers = [45, 4, 9, 16, 26];
  var outputNumber = 0;
  var expectedValue = 100;

  try {
    outputNumber = numbers.reduce(reducerTwoArg);
  } catch (e) {
    outputNumber = 0;
    act.error('Unexpected error: ' + (e && e.message) || 'unknown');
  }

  return outputNumber !== 0 && outputNumber === expectedValue;
}

function arrayReduceFunctionTestThreeParameters() {
  var numbers = [0, 1, 2, 3, 4];
  var outputNumber = 0;
  var expectedValue = 7;

  try {
    outputNumber = numbers.reduce(ReduceWithThreeParameters);
  } catch (e) {
    outputNumber = 0;
    act.error('Unexpected error: ' + (e && e.message) || 'unknown');
  }

  return outputNumber !== 0 && outputNumber === expectedValue;
}

function arrayReduceFunctionTestWithInitialValueParameters() {
  var numbers = [0, 1, 2, 3, 4];
  var outputNumber = 0;
  var expectedValue = 20;

  try {
    outputNumber = numbers.reduce(ReduceWithInitialValue, 10);
  } catch (e) {
    outputNumber = 0;
    act.error('Unexpected error: ' + (e && e.message) || 'unknown');
  }

  return outputNumber !== 0 && outputNumber === expectedValue;
}
// Passing two Parameters
function reducerTwoArg(acc, value) {
  return acc + value;
}

// Passing three Parameters
function ReduceWithThreeParameters(acc, value, index) {
  return index > 2 ? acc + value : 0;
}

// Passing initial value
function ReduceWithInitialValue(acc, value) {
  return acc + value;
}

function RunAllTestFunctions() {
  var arrayOfFunctions = [];
  var allTestPass = true;

  arrayOfFunctions.push(arrayReduceFunctionTestTwoParam);
  arrayOfFunctions.push(arrayReduceFunctionTestThreeParameters);
  arrayOfFunctions.push(arrayReduceFunctionTestWithInitialValueParameters);

  for (var j = 0; j < arrayOfFunctions.length; j++) {
    allTestPass = allTestPass && arrayOfFunctions[j]();
  }

  return allTestPass;
}

function runTest() {
  act.start();
  try {
    RunAllTestFunctions()
      ? act.success()
      : act.fail(`Array.prototype.reduce failed to work as expected`);
  } catch (e) {
    act.fail(e.message);
  }
}

loadSDK(runTest);
