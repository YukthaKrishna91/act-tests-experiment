function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var timeoutFailureMessage = 'Wakelock release callback was not called within 900ms of test start';
var failureTimer = setTimeout(function () {
  act.fail(timeoutFailureMessage);
}, 900);

function failTest(message) {
  clearTimeout(failureTimer);
  act.fail(message);
}

function requestWakeLock() {
  try {
    return navigator.wakeLock.request('screen');
  } catch (error) {
    return Promise.reject(error);
  }
}

function releaseCallback() {
  clearTimeout(failureTimer);
  act.success();
}

function onWakelockGranted(sentinel) {
  act.log('WakeLock request successful');
  sentinel.addEventListener('release', releaseCallback);
  try {
    sentinel.release();
  } catch (error) {
    failTest(error.message);
  }
}

function onWakelockRejection(error) {
  act.log('WakeLock request failed');
  failTest(error.message);
}

function runTest() {
  act.start();

  try {
    requestWakeLock().then(onWakelockGranted).catch(onWakelockRejection);
  } catch (err) {
    clearTimeout(failureTimer);
    var message = (err && err.message) || err || 'Something went wrong!';
    act.error(message);
  }
}

loadSDK(runTest);
