import act from 'act-sdk';

import {
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

    const ws = new WebSocket(url);

    ws.onopen = function () {
      const negotiationRequest = {
        jsonrpc: '2.0',
        method: 'org.hbbtv.negotiateMethods',
        id: 1,
        params: {
          terminalToApp: [],
          appToTerminal: ['org.hbbtv.negotiateMethods']
        }
      };

      ws.send(JSON.stringify(negotiationRequest));
    };

    let negotiationComplete = false;
    let responsesReceived = [];

    ws.onmessage = function (event) {
      const message = event.data;

      try {
        const parsed = JSON.parse(message);

        if (!negotiationComplete && parsed.id === 1) {
          negotiationComplete = true;

          // Send 8 individual JSON-RPC requests rapidly
          // Using org.hbbtv.negotiateMethods as we know it's supported
          for (let i = 2; i <= 9; i++) {
            const request = {
              jsonrpc: '2.0',
              id: i,
              method: 'org.hbbtv.negotiateMethods',
              params: {
                terminalToApp: [],
                appToTerminal: ['org.hbbtv.negotiateMethods']
              }
            };
            ws.send(JSON.stringify(request));
          }
        } else if (negotiationComplete) {
          responsesReceived.push(parsed);

          if (responsesReceived.length === 8) {
            const allNonBatched = responsesReceived.every((response) => {
              return !Array.isArray(response) && typeof response === 'object';
            });

            if (allNonBatched) {
              act.success();
            } else {
              act.fail('Responses were batched');
            }

            ws.close();
          }
        }
      } catch (e) {
        act.error('Failed to parse message: ' + e.message);
        ws.close();
      }
    };

    ws.onerror = function (error) {
      act.error('WebSocket error: ' + error.message);
    };

    ws.onclose = function () {
      if (responsesReceived.length < 8 && negotiationComplete) {
        act.fail('Connection closed before receiving all responses');
      }
    };
  } catch (e) {
    act.error(e);
  }
}

runTest();
