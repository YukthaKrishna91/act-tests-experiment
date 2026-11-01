function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

const runTest = () => {
  act.start();

  if (!('IntersectionObserver' in window)) {
    act.fail('IntersectionObserver not found');
    return;
  }
  if (!('IntersectionObserverEntry' in window)) {
    act.fail('IntersectionObserverEntry not found');
    return;
  }

  if (!('intersectionRatio' in window.IntersectionObserverEntry.prototype)) {
    act.fail('IntersectionObserverEntry missing intersectionRatio property');
    return;
  }

  if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
    act.fail('IntersectionObserverEntry missing isIntersecting property');
    return;
  }

  act.success();
};

loadSDK(runTest);
