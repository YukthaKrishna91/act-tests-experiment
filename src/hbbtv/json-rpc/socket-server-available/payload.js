import act from 'act-sdk';

import {
  containsLocalWebSocketUrl,
  getCapabilitiesElement,
  getCapabilitiesXML,
  getJsonRpcServerElement
} from '../util/hbbtvrpc.js';

function runTest() {
  act.start();

  try {
    const capabilitiesElement = getCapabilitiesElement();
    if (capabilitiesElement === undefined) {
      act.fail('No oipfcapabilities element found');
      return;
    }

    const xmlDoc = getCapabilitiesXML(capabilitiesElement);
    if (xmlDoc === undefined) {
      act.fail('No XML capabilities found in element');
      return;
    }

    const jsonRpcEl = getJsonRpcServerElement(xmlDoc);
    if (jsonRpcEl === undefined) {
      act.fail('No JSON-RPC server element found in XML capabilities');
      return;
    }

    const url = jsonRpcEl.getAttribute('url');
    if (url === undefined) {
      act.fail('The JSON-RPC element does not contain a url attribute');
      return;
    }

    containsLocalWebSocketUrl(url)
      ? act.success()
      : act.fail('The JSON-RPC url is not a localhost websocket endpoint');
  } catch (e) {
    act.error(e);
  }
}

runTest();
