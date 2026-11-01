function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function getCorsEndpoint() {
  return 'https://networking.certification.bbctvapps.co.uk/cors/fake-origin';
}

function assertFetchCors() {
  if (typeof window.fetch === 'undefined' && typeof fetch === 'undefined') {
    act.fail(['Fetch is not defined']);
  }

  var requestInit = {
    method: 'GET',
    headers: [
      ['Accept', 'text/html'],
      ['Accept', 'application/json']
    ],
    mode: 'cors',
    cache: 'no-cache'
  };

  var request = new Request(getCorsEndpoint());

  fetch(request, requestInit)
    .then(function (response) {
      if (response.ok) {
        act.fail(['Received unexpected successful response', response.status]);
      }
      act.error();
    })
    .catch(function () {
      act.success();
    });
}

function runTest() {
  act.start();

  try {
    assertFetchCors();
  } catch (error) {
    act.error(error.message);
  }
}

loadSDK(runTest);
