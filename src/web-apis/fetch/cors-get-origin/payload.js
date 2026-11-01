function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function runTest() {
  act.start();

  if (typeof window.fetch === 'undefined' && typeof fetch === 'undefined') {
    act.fail(['Fetch is not defined']);
  }

  var apiUrl = 'https://networking.certification.bbctvapps.co.uk/cors/default-origin';
  fetch(apiUrl)
    .then(function (response) {
      act.log(['Response Recieved', response.status]);

      return response.text();
    })
    .then(function (response) {
      act.log(['Response Text', response]);

      var expectedResponse = [
        'Your Origin header: ',
        document.location.protocol,
        '//',
        document.location.host
      ].join('');

      if (response === expectedResponse) {
        act.success();
      } else {
        act.fail([
          'Test response ',
          response,
          ' differs from expected response ',
          expectedResponse
        ]);
      }
    })
    .catch(function (error) {
      act.error([error.message]);
    });
}

loadSDK(runTest);
