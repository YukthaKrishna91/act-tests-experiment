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

function getServiceWorkerPath() {
  return (
    '/act/test/monorepo/latest/web-apis/service-worker/fetch-intercept/service-worker.js?ts=' +
    Date.now()
  );
}

function runTest() {
  act.start();
  try {
    registerServiceWorker(getServiceWorkerPath(), './')
      .then((registration) => onRegister(registration))
      .then(() => {
        act.log('starting fetch... ');
        return fetch(
          '/act/test/monorepo/latest/web-apis/service-worker/fetch-intercept/newtv.png'
        ).then((response) => {
          act.log('got fetch response');
          return response.blob();
        });
      })
      .then((blob) => {
        act.log(
          `expected blob size: '38202', got '${blob.size}'. expected blob type 'image/jpeg', got '${blob.type}'`
        );
        if (blob.type === 'image/jpeg' && blob.size === 38202) {
          act.success();
        } else {
          act.fail(
            `expected fetch interception; expected blob size: '38202', got '${blob.size}'. expected blob type 'image/jpeg', got '${blob.type}'`
          );
        }
      })
      .catch((e) => act.fail(JSON.stringify(e.message)));
  } catch (e) {
    act.log(e.message);
    act.fail(e.message);
  }
}

loadSDK(runTest);
