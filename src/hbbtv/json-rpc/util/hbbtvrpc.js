export function getCapabilitiesElement() {
  const elements = document.getElementsByTagName('object');
  if (elements && elements.length) {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type.toLowerCase() === 'application/oipfcapabilities') {
        return elements[i];
      }
    }
  }
}

export function getCapabilitiesXML(element) {
  if (element && Object.keys(element).includes('xmlCapabilities')) {
    return element.xmlCapabilities;
  }
}

export function getJsonRpcServerElement(xmlDoc) {
  return xmlDoc.getElementsByTagName('json_rpc_server')[0];
}

export function containsLocalWebSocketUrl(uri) {
  return /^(ws[s]?:\/\/localhost:)/.test(uri);
}
