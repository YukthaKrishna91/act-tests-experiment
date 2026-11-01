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
    var testCase =
      '<div id="item" tabindex="-1" aria-describedby="description1 description2">Element Content</div>' +
      '<div id="description1">Description 1</div>' +
      '<div id="description2">Description 2</div>';
    var content = document.createElement('div');
    content.style.display = 'inline-block';
    content.innerHTML = testCase;
    var render = function (next) {
      return function () {
        return act.render(content, next);
      };
    };

    var focus = function (next) {
      return function () {
        document.getElementById('item').focus();
        next();
      };
    };

    var questionOne = function (next) {
      return function () {
        act
          .ask(
            'Did the screen reader read out include single occurrences of the phrases "Element Content", "Description 1" and "Description 2"?'
          )
          .addButton('Yes', true, 'primary')
          .addButton('No', false, 'warning')
          .send(function (response) {
            return response ? act.success() : next();
          });
      };
    };

    var questionTwo = function (next) {
      return function () {
        act
          .ask(
            'In the previously attempted read out, did the read out include a single occurrence of "Element Content"?'
          )
          .addButton('Yes', true, 'primary')
          .addButton('No', false, 'warning')
          .send(function (response) {
            return response
              ? next()
              : act.fail('Did not read out the text content of the aria-describedby element once');
          });
      };
    };

    var questionThree = function (next) {
      return function () {
        act
          .ask(
            'In the previously attempted read out, did the read out include a single occurrence of "Description 1"?'
          )
          .addButton('Yes', true, 'primary')
          .addButton('No', false, 'warning')
          .send(function (response) {
            return response
              ? next()
              : act.fail(
                  'Did not read out the text content of the first description referenced by the aria-describedby element once'
                );
          });
      };
    };

    var questionFour = function (next) {
      return function () {
        act
          .ask(
            'In the previously attempted read out, did the read out include a single occurrence of "Description 2"?'
          )
          .addButton('Yes', true, 'primary')
          .addButton('No', false, 'warning')
          .send(function (response) {
            return response
              ? next()
              : act.fail(
                  'Did not read out the text content of the second description referenced by the aria-describedby element once'
                );
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
      screenReaderEnabledPrompt(
        render(focus(questionOne(questionTwo(questionThree(questionFour(act.success))))))
      )
    );
  } catch (e) {
    act.error(e);
  }
}

loadSDK(runTest);
