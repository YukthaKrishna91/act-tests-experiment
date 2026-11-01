function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function AssertionError(message) {
  this.message = message || '';
}

AssertionError.prototype.toString = function () {
  return this.message;
};

AssertionError.thrower = (message) => {
  throw new AssertionError(message);
};

function isUnreached(message) {
  throw new AssertionError(message);
}

function unregisterServiceWorker(scope) {
  var absoluteScope = new URL(scope, window.location).href;
  var errorHandler = (e) => {
    act.log(e.message);
    isUnreached('unregister should not fail');
  };

  return navigator.serviceWorker
    .getRegistration(scope)
    .then((registration) => {
      if (registration && registration.scope === absoluteScope) {
        act.log(`unregistering service workers`);
        return registration.unregister();
      }
    })
    .catch(errorHandler);
}

function registerServiceWorker(url, scope) {
  var errorHandler = (e) => {
    act.log(e.message);
    isUnreached('unregister and register should not fail');
  };

  return unregisterServiceWorker(scope)
    .then(() => {
      act.log(`registering service worker: ${url}`);
      return navigator.serviceWorker.register(url, { scope });
    })
    .catch(errorHandler);
}

function onRegister(registration) {
  var serviceWorker;

  if (registration.installing) {
    serviceWorker = registration.installing;
  } else if (registration.waiting) {
    serviceWorker = registration.waiting;
  } else if (registration.active) {
    serviceWorker = registration.active;
  }

  return new Promise((resolve) => {
    serviceWorker.onstatechange = () => {
      act.log(`service worker status: ${serviceWorker.state}`);
      if (serviceWorker.state === 'activated') {
        resolve(serviceWorker);
      }
    };
  });
}

function sendMessageToWorker(worker, from) {
  var messageChannel = new MessageChannel();
  worker.postMessage({ from: from, port: messageChannel.port2 }, [messageChannel.port2]);
  return messageChannel.port1;
}

function heartBeat() {
  var intervals = [];
  var intervalInMs = 25;
  var ref;

  return {
    start: () => {
      ref = setInterval(() => {
        intervals.push(Date.now());
      }, intervalInMs);
    },
    stop: () => {
      clearInterval(ref);
      return intervals;
    },
    checkDeviations: () => {
      var output = [];

      for (var i = 0; i < intervals.length - 1; i++) {
        var difference = intervals[i + 1] - intervals[i];
        if (difference > intervalInMs + 2) {
          output.push(difference);
        }
      }

      return output;
    }
  };
}

function getServiceWorkerPath() {
  return (
    '/act/test/monorepo/latest/web-apis/service-worker/non-blocking-thread/service-worker.js?ts=' +
    Date.now()
  );
}

function runTest() {
  act.start();
  var hb = heartBeat();
  try {
    registerServiceWorker(getServiceWorkerPath(), './')
      .then((registration) => onRegister(registration))
      .then((serviceWorker) => {
        act.log('starting heartbeat');
        hb.start();

        return new Promise((resolve) => {
          act.log('sending message to worker using MessageChannel()');

          sendMessageToWorker(serviceWorker, {
            amplitudeEnd: 0.5,
            amplitudeStart: 0,
            duration: 12,
            frequency: 411,
            numberOfChannels: 2,
            sampleRate: 48000
          }).onmessage = function (e) {
            act.log('received message from worker');
            resolve(e.data);
          };
        });
      })
      .then((data) => {
        act.log(`stopping heartbeat...`);
        hb.stop();
        act.log(
          `datalength: ${data.length} - data[0]length: ${data[0].length} - data[1]length: ${data[1].length}`
        );

        var deviations = hb.checkDeviations();
        act.log(`heartbeat intervals that took more than 25ms: ${JSON.stringify(deviations)}`);

        if (data.length === 2 && data[0].length === 576000 && data[1].length === 576000) {
          act.success();
        } else {
          act.error('Recieved incomplete data from service worker');
        }
      })
      .catch((e) => act.log(JSON.stringify(e.message)));
  } catch (e) {
    act.log(e.message);
    act.fail(e.message);
  }
}

loadSDK(runTest);
