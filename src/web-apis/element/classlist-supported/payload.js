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

  var $el = document.createElement('div');
  if ($el.classList instanceof DOMTokenList !== true) {
    act.fail('not an instance of DOMTokenList');
    return;
  }

  if ($el.className !== '') {
    act.fail('element incorrectly had existing class');
    return;
  }

  $el.classList.add('a');

  if ($el.className !== 'a') {
    act.fail('classList.add does not work');
    return;
  }

  $el.classList.add('a');

  if ($el.className !== 'a') {
    act.fail('using classList.add on existing class should not have listed the class twice');
    return;
  }

  $el.classList.remove('nonexistent');

  if ($el.className !== 'a') {
    act.fail('classList.remove breaks when trying to remove a non-existent class');
    return;
  }

  $el.classList.remove('a');

  if ($el.className !== '') {
    act.fail('classList.remove does not work');
    return;
  }

  $el.className = 'a';
  $el.classList.remove('a');

  if ($el.className !== '') {
    act.fail('classList.remove breaks on element with an existing class');
    return;
  }

  $el.classList.add('a', 'b');

  if ($el.className !== 'a b') {
    act.fail('classList.add does not work with two arguments');
    return;
  }

  $el.classList.remove('a', 'b');
  if ($el.className !== '') {
    act.fail('classList.remove does not work with two arguments');
    return;
  }

  $el.classList.toggle('a');

  if ($el.className !== 'a') {
    act.fail('classList.toggle does not work');
    return;
  }

  $el.classList.toggle('a', false);

  if ($el.className !== '') {
    act.fail('classList.toggle does not work with two arguments');
    return;
  }

  $el.classList.toggle('a', false);

  if ($el.className !== '') {
    act.fail('second argument of classList.toggle incorrectly adds/removes class');
    return;
  }

  act.success();
}

loadSDK(runTest);
