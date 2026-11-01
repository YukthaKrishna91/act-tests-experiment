var started = new Event('started');
var success = new Event('finished:success');
var error = new Event('finished:error');

function dispatchTelemetry(detail) {
  var telemetry = new CustomEvent('telemetry', { detail: detail });
  document.dispatchEvent(telemetry);
}

function dispatchFailure(reason) {
  var failure = new CustomEvent('finished:failure', { detail: reason });
  document.dispatchEvent(failure);
}

function getDateTimeFromServer(callback) {
  var url = './?dt=' + Date.now();

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      var serverTime = new Date(xmlhttp.getResponseHeader('date')).getTime();
      callback(serverTime);
    }
  };
  xmlhttp.open('GET', url, true);
  xmlhttp.send();
}

function correctTimeTest() {
  var startTime = Date.now();
  var threshold = 3000;
  dispatchTelemetry('Client Begin Time: ' + startTime);
  dispatchTelemetry('Threshold: ' + threshold);
  getDateTimeFromServer(function (serverDate) {
    var endTime = Date.now();
    dispatchTelemetry('Server Time: ' + serverDate);
    dispatchTelemetry('Round Trip Time: ' + (endTime - startTime));
    var minTime = startTime - threshold;
    var maxTime = endTime + threshold;
    dispatchTelemetry(['Range start: ' + minTime, 'Range End: ' + maxTime]);
    if (serverDate <= startTime - threshold) {
      dispatchFailure('Client is ahead of reference time');
    } else if (serverDate >= endTime + threshold) {
      dispatchFailure('Client is behind reference time');
    } else {
      document.dispatchEvent(success);
    }
  });
}

function runTest() {
  try {
    correctTimeTest();
  } catch {
    document.dispatchEvent(error);
  }
}

document.dispatchEvent(started);
runTest();
