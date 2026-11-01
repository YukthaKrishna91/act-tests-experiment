function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function getCapabilitiesElement() {
  var elements = document.getElementsByTagName('object');
  if (elements && elements.length) {
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].type.toLowerCase() === 'application/oipfcapabilities') {
        return elements[i];
      }
    }
  }
}

function getCapabilitiesXML(element) {
  if (element && element.xmlCapabilities) {
    return element.xmlCapabilities;
  }
}

function runTest() {
  var capabilitiesElement = getCapabilitiesElement();
  var xmlDoc = getCapabilitiesXML(capabilitiesElement);
  if (xmlDoc) {
    var videoDisplayFormat = xmlDoc.getElementsByTagName('video_display_format');
    const isSuccess = videoDisplayFormat && !!videoDisplayFormat.length;
    isSuccess ? act.success() : act.fail();
  } else {
    act.fail();
  }
}

loadSDK(runTest);
