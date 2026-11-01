function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

var baseUrl = 'https://networking.certification.bbctvapps.co.uk/embeddedContent/';

function loadStylesheet() {
  var head = document.getElementsByTagName('HEAD')[0];
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = baseUrl + 'redirect/style.css';
  head.appendChild(link);
  act.log('Loading stylesheet from ' + link.href);
}

function generateHtml(format) {
  return [
    '<h4>',
    format.toUpperCase(),
    ' Test</h4>',
    '<table>',
    '<tr>',
    '<td>Test</td>',
    '<td><div class="iPlayer_',
    format,
    ' iPlayer"></div></td>',
    '<td><div class="sounds_',
    format,
    ' sounds"></div></td>',
    '</tr>',
    '<tr>',
    '<td>Comparison</td>',
    '<td><div class="iPlayer_',
    format,
    '_comparison iPlayer"></div></td>',
    '<td><div class="sounds_',
    format,
    '_comparison sounds"></div></td>',
    '</tr>',
    '</table>',
    '<br>'
  ].join('');
}

function generateCss(format) {
  return [
    '<style>',
    '.iPlayer {',
    'background-size: cover;',
    'width: 250px;',
    'height: 94px;',
    'margin: 20px;',
    '}',
    '.sounds {',
    'background-size: cover;',
    'width: 250px;',
    'height: 94px;',
    'margin: 20px;',
    '}',
    '.sounds_',
    format,
    '_comparison {',
    'background-image: url("',
    baseUrl,
    'location/images/sounds_logo.',
    format,
    '?");', // '?' to prevent caching
    '}',
    '.iPlayer_',
    format,
    '_comparison {',
    'background-image: url("',
    baseUrl,
    'location/images/iPlayer_logo.',
    format,
    '?");', // '?' to prevent caching
    '}',
    '</style>'
  ].join('');
}

const testCases = ['jpg', 'png', 'svg'];
var nextTestIndex = 0;
const failedTests = [];

function runTestForFileFormat(format) {
  act.log('Running redirect test for ' + format + ' format');

  var divElement = document.createElement('div');
  divElement.innerHTML = generateCss(format) + generateHtml(format);

  act.render(divElement);

  act
    .ask('Do the test images match the comparison images?')
    .addButton('Yes', true, 'primary')
    .addButton('No', false, 'secondary')
    .send(function (success) {
      nextTestIndex++;
      if (success) {
        act.log('Redirect test was successful for ' + format + ' format');
      } else {
        act.log('Redirect test failed for ' + format + ' format');
        failedTests.push(format);
      }
      if (nextTestIndex === testCases.length) {
        if (failedTests.length === 0) {
          act.success();
        } else {
          act.fail(
            'The redirect tests failed for the following formats: ' + failedTests.join(', ')
          );
        }
      } else {
        runTestForFileFormat(testCases[nextTestIndex]);
      }
    });
}

function runTests() {
  act.start();
  loadStylesheet();
  runTestForFileFormat(testCases[nextTestIndex]);
}

loadSDK(runTests);
