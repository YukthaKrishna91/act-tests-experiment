function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function requestWakeLock() {
  try {
    return navigator.wakeLock.request('screen');
  } catch (error) {
    return Promise.reject(error);
  }
}

function onWakelockGranted(sentinel) {
  act.log('WakeLock request successful');
  sentinel.addEventListener('release', function () {
    act.log('Wakelock released');
    act.success();
  });
  sentinel.release();
}

function onWakelockRejection(error) {
  act.log('WakeLock request failed');
  act.fail(error.message);
}

function runTest() {
  act.start();
  try {
    requestWakeLock().then(onWakelockGranted).catch(onWakelockRejection);
  } catch (err) {
    var message = (err && err.message) || err || 'Something went wrong!';
    act.error(message);
  }
}

loadSDK(runTest);
