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

function isSameValue(a, b) {
  if (a === b) {
    // Handle +/-0 vs. -/+0
    return a !== 0 || 1 / a === 1 / b;
  }

  // Handle NaN vs. NaN
  return a !== a && b !== b;
}

function isEqual(actual, expected) {
  var msg = `Assertion failed: Expected "${expected}" of type "${typeof expected}", but got "${actual}" of type "${typeof actual}"`;

  if (typeof actual !== typeof expected) {
    throw new AssertionError(msg);
  }

  if (isSameValue(actual, expected) !== true) {
    throw new AssertionError(msg);
  }

  return true;
}

function arrayEquals(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
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

var serviceWorkerStates = [];
function sendMessageToWorker(worker, from) {
  var messageChannel = new MessageChannel();
  worker.postMessage({ from: from, port: messageChannel.port2 }, [messageChannel.port2]);
  return messageChannel.port1;
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
      serviceWorkerStates.push(serviceWorker.state);
      act.log(`service worker status: ${serviceWorker.state}`);

      if (serviceWorker.state === 'activated') {
        var expectedStateChanges = ['installed', 'activating', 'activated'];
        act.log(`observed service worker states: ${serviceWorkerStates.join()}`);

        if (!arrayEquals(serviceWorkerStates, ['installed', 'activating', 'activated'])) {
          act.error(
            `observed service worker states: ${serviceWorkerStates.join()} does not match expected state change: ${expectedStateChanges.join()}`
          );
        }

        resolve(serviceWorker);
      }
    };
  });
}

function getServiceWorkerPath() {
  return (
    '/act/test/monorepo/latest/web-apis/service-worker/registration/service-worker-end-to-end.js?ts=' +
    Date.now()
  );
}

function runTest() {
  act.start();
  try {
    isEqual(navigator.serviceWorker instanceof ServiceWorkerContainer, true);
    isEqual(typeof navigator.serviceWorker.register, 'function');
    isEqual(typeof navigator.serviceWorker.getRegistration, 'function');

    registerServiceWorker(getServiceWorkerPath(), './')
      .then((registration) => onRegister(registration))
      .then((serviceWorker) => {
        return new Promise((resolve) => {
          act.log('sending message to worker using MessageChannel()');
          sendMessageToWorker(serviceWorker, 'act_test').onmessage = function (e) {
            act.log(`received message from worker: '${e.data}'`);
            resolve(e.data);
          };
        });
      })
      .then((data) => {
        isEqual(data, 'ACK: act_test');
        act.success();
      });
  } catch (e) {
    act.log(e);
    console.error(e);
    act.fail(e.message);
  }
}

loadSDK(runTest);
