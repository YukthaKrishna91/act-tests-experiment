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
  try {
    var content = document.createElement('div');
    content.style.display = 'inline-block';
    content.innerHTML =
      '<div id="my-button-aria" tabindex="-1" aria-label="Aria Label">Element Content</div>';
    var render = function (next) {
      return function () {
        return act.render(content, next);
      };
    };

    var focus = function (next) {
      return function () {
        document.getElementById('my-button-aria').focus();
        next();
      };
    };

    var questionOne = function (next) {
      return function () {
        act
          .ask(
            'Did the screen reader read out include a single occurrence of the phrase "Aria Label"?'
          )
          .addButton('Yes', true, 'primary')
          .addButton('No', false, 'warning')
          .send(function (response) {
            return response ? next() : act.fail('Did not read out the aria-label value');
          });
      };
    };

    var questionTwo = function (next) {
      return function () {
        act
          .ask(
            'In the previous read out, did the the read out include the phrase "Element Content"?'
          )
          .addButton('Yes', true, 'primary')
          .addButton('No', false, 'warning')
          .send(function (response) {
            return response
              ? act.fail('Read out the text content of the aria-label element')
              : next();
          });
      };
    };

    var screenReaderEnabledPrompt = function (next) {
      return function () {
        act
          .ask('Make sure the screen reader is enabled')
          .addButton('Ready', true, 'primary')
          .send(next);
      };
    };

    var screenReaderPresentQuestion = function (next) {
      act
        .ask('Does the device have a screen reader?')
        .addButton('Yes', true, 'primary')
        .addButton('No', false, 'warning')
        .send(function (response) {
          return response ? next() : act.fail('Device cannot read out the screen');
        });
    };

    screenReaderPresentQuestion(
      screenReaderEnabledPrompt(render(focus(questionOne(questionTwo(act.success)))))
    );
  } catch (e) {
    act.error(e);
  }
}

loadSDK(runTest);
