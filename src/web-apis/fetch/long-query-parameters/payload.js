function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var allA = repeatStringXTimes(1024, 'a');
var allB = repeatStringXTimes(4096, 'b');
var baseUrl = 'https://networking.certification.bbctvapps.co.uk/url-length';

var queryParamHeaderName = 'query-parameter-lengths';

function repeatStringXTimes(x, string) {
  var counter = 0;
  var newString = '';
  while (counter < x) {
    newString = newString + string;
    counter++;
  }
  return newString;
}

function dispatchTelemetry(detail) {
  act.log(detail);
}

var fileExtensions = ['.html', '.js', '.json', '.css', '.jpg'];
var successfulTests = 0;

function runTestForFileExtension(fileExtension) {
  var apiUrl = [baseUrl, fileExtension, '?a=', allA, '&b=', allB].join('');
  fetch(apiUrl).then(function (response) {
    const queryParamHeader = response.headers.get(queryParamHeaderName);
    if (!queryParamHeader) {
      act.fail([`No header named '${queryParamHeaderName}' was present on the response`]);
    }

    runAssertion(JSON.parse(queryParamHeader));
    successfulTests++;

    if (successfulTests === fileExtensions.length) {
      act.success();
    }
  });
}

function runTests() {
  act.start();

  if (typeof window.fetch === 'undefined' && typeof fetch === 'undefined') {
    act.fail(['Fetch is not defined']);
  }

  fileExtensions.map(function (extension) {
    runTestForFileExtension(extension);
  });
}

function runAssertion(actualResponse) {
  var expectedResponse = { a: allA.length, b: allB.length };
  dispatchTelemetry([
    'Test response',
    JSON.stringify(actualResponse),
    'compared to',
    JSON.stringify(expectedResponse)
  ]);
  if (actualResponse.a !== expectedResponse.a || actualResponse.b !== expectedResponse.b) {
    act.fail([
      'Actual response ',
      JSON.stringify(actualResponse),
      ' differs from expected response ',
      JSON.stringify(expectedResponse)
    ]);
  }
}

loadSDK(runTests);
