var started = new Event('started');
var success = new Event('finished:success');
var failure = new Event('finished:failure');
var error = new Event('finished:error');

function renderElement(element) {
  var renderRequest = new CustomEvent('requestRenderArea', { detail: element });
  document.dispatchEvent(renderRequest);
}

function requestIntervention(element, callback) {
  document.addEventListener('responseToIntervention', function interventionResponse(ev) {
    document.removeEventListener('responseToIntervention', interventionResponse);
    callback(ev.detail);
  });
  var interventionRequest = new CustomEvent('requestIntervention', { detail: element });
  document.dispatchEvent(interventionRequest);
}

function runInterventionLogic() {
  var request = {
    type: 'manual-intervention',
    request: {
      text: 'Do the pairs of images all match?',
      options: [
        {
          label: 'Yes',
          value: true,
          class: 'primary'
        },
        {
          label: 'No',
          value: false,
          class: 'secondary'
        }
      ]
    }
  };

  function handleInterventionResponse(receivedResponse) {
    try {
      document.dispatchEvent(receivedResponse.response.userResponse ? success : failure);
    } catch {
      document.dispatchEvent(error);
    }
  }

  requestIntervention(request, handleInterventionResponse);
}

function aperture(n, assets) {
  var rows = [];
  for (var i = 0; i < assets.length / n; i++) {
    var slice = assets.slice(i * n, (i + 1) * n);
    rows.push(slice);
  }
  return rows;
}

function getCss() {
  return [
    '<style>',
    '.table {',
    'background-color: #808080;',
    'color: #ffffff;',
    'width: 100%;',
    'text-align: center;',
    '}',
    '.svg-rendering .svgImage {',
    'width: 69px;',
    '}',
    '.svg-rendering .pngImage {',
    'width: 69px;',
    '}',
    '.svg-rendering .imagePair {',
    'padding: 0 20px 0 20px;',
    '}',
    '.svg-rendering .title {',
    'font-family: "Helvetica";',
    'font-size: 25px;',
    'font-size: 3vh;',
    'margin: 0 0 0 0;',
    'padding: 4% 0 4% 2%;',
    'width: 100%;',
    '}',
    '</style>'
  ].join('');
}

function getHtml(assets) {
  function getRow(assets) {
    return assets
      .map(function (asset) {
        return (
          '<td><div class="imagePair"><img id="svg0" class="svgImage" src="' +
          asset +
          '.svg"><img id="png0" class="pngImage" src="' +
          asset +
          '.png"></div></td>'
        );
      })
      .join('');
  }

  function getRows(assetGroups) {
    return assetGroups
      .map(function (assets) {
        return '<tr>' + getRow(assets) + '</tr>';
      })
      .join('');
  }

  return [
    '<table class="table">',
    '<tbody>',
    '<tr>',
    '<td><p class="title">SVG / Expected</p></td>',
    '</tr>',
    '<tr>',
    getRows(aperture(4, assets)),
    '</tr>',
    '</tbody>',
    '</table>'
  ].join('');
}

function runTest() {
  try {
    var assetBaseUrl = '/act/test/monorepo/latest/html/img/supports-svg/assets/';
    var assetNames = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      'bbc_1xtra',
      'bbc_6music',
      'bbc_asian_network',
      'bbc_london',
      'bbc_radio_cymru',
      'bbc_radio_cymru_2',
      'bbc_radio_five_live_sports_extra',
      'bbc_radio_four',
      'bbc_radio_foyle',
      'bbc_radio_nan_gaidheal',
      'bbc_radio_one',
      'bbc_radio_scotland',
      'bbc_radio_three',
      'bbc_radio_two',
      'bbc_radio_ulster',
      'bbc_radio_wales',
      'bbc_world_service',
      'cbeebies_radio'
    ];
    var assets = assetNames.map((asset) => assetBaseUrl.concat(asset));
    var html = getHtml(assets);
    var css = getCss();

    var renderDivToSend = document.createElement('div');
    renderDivToSend.className = 'svg-rendering';
    renderDivToSend.innerHTML = css + html;

    renderElement(renderDivToSend);
    runInterventionLogic();
  } catch {
    document.dispatchEvent(error);
  }
}

document.dispatchEvent(started);
runTest();
