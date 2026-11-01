function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var baseUrl = 'https://networking.certification.bbctvapps.co.uk/content/';

var queryParams = '?queryOne=BBCACTableTest';

function dispatchTelemetry(detail) {
  act.log(detail);
}

var testCases = [
  {
    fileExtension: '.html',
    expectedResponseBody: '<!DOCTYPE html>\n<html><h1>Hello, world</h1></html>',
    mimeType: 'text/html'
  },
  {
    fileExtension: '.js',
    expectedResponseBody: 'var hello = "world"',
    mimeType: 'text/javascript'
  },
  {
    fileExtension: '.json',
    expectedResponseBody: JSON.stringify({ success: true }),
    mimeType: 'application/json'
  },
  { fileExtension: '.css', expectedResponseBody: 'html {border: 0;}', mimeType: 'text/css' },
  { fileExtension: '.jpg', expectedResponseBody: null, mimeType: 'image/jpeg' }
];
var successfulTests = 0;

function runTestForJpg(testCase) {
  var base64JpgHashHeader = '';
  fetch(getApiUrl(testCase.fileExtension))
    .then(function (response) {
      base64JpgHashHeader = response.headers.get('base64-jpg-hash');

      checkHeaders(response, testCase);

      return response.arrayBuffer();
    })
    .then(function (buffer) {
      var base64JpgHash = bufferToBase64(buffer);

      if (base64JpgHash !== base64JpgHashHeader) {
        act.fail(['Invalid base64 image hash (.jpg)']);
        return;
      }
      successfulTests++;
      if (successfulTests === testCases.length) {
        act.success();
      }
    });
}

function bufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function runTestForTestCase(testCase) {
  fetch(getApiUrl(testCase.fileExtension))
    .then(function (response) {
      checkHeaders(response, testCase);

      return response.text();
    })
    .then(function (body) {
      dispatchTelemetry([
        `Response body (${testCase.fileExtension})`,
        `expected: ${testCase.expectedResponseBody}`,
        `received: ${body}`
      ]);

      if (testCase.expectedResponseBody !== body) {
        act.fail([
          `Invalid response body (${testCase.fileExtension})`,
          `expected: ${testCase.expectedResponseBody}`,
          `received: ${body}`
        ]);
        return;
      }
      successfulTests++;
      if (successfulTests === testCases.length) {
        act.success();
      }
    });
}

function getApiUrl(fileExtension) {
  return [baseUrl, 'redirect', fileExtension, queryParams].join('');
}

function checkHeaders(response, testCase) {
  var expectedLocationHeader = `other_location${testCase.fileExtension}?queryOne=BBCACTableTest`;
  var locationHeader = response.headers.get('content-location');
  var contentTypeHeader = response.headers.get('content-type');

  dispatchTelemetry([
    `Location header (${testCase.fileExtension})`,
    `expected: ${expectedLocationHeader}`,
    `received: ${locationHeader}`
  ]);
  dispatchTelemetry([
    `Content type header (${testCase.fileExtension})`,
    `expected to include: ${testCase.mimeType}`,
    `received: ${contentTypeHeader}`
  ]);

  if (locationHeader !== expectedLocationHeader) {
    act.fail([
      `Incorrect location header (${testCase.fileExtension})`,
      `expected: ${expectedLocationHeader}`,
      `received: ${locationHeader}`
    ]);
  }
  if (!contentTypeHeader || !contentTypeHeader.includes(testCase.mimeType)) {
    act.fail([
      `Incorrect content type header (${testCase.fileExtension})`,
      `expected to include: ${testCase.mimeType}`,
      `received: ${contentTypeHeader}`
    ]);
  }
}

function runTests() {
  act.start();

  if (typeof window.fetch === 'undefined' && typeof fetch === 'undefined') {
    act.fail(['Fetch is not defined']);
  }

  testCases.forEach(function (testCase) {
    dispatchTelemetry(['Running test for ', testCase.fileExtension]);

    if (testCase.fileExtension === '.jpg') {
      runTestForJpg(testCase);
    } else {
      runTestForTestCase(testCase);
    }
  });
}

loadSDK(runTests);
