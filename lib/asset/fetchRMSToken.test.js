import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { fetchRMSToken } from './fetchRMSToken.js';

import { getError } from '../error/getError.js';
import { FetchError } from '../error/FetchError.js';

describe('fetchRMSToken function', () => {
  let agent;

  beforeEach(() => {
    agent = new MockAgent();
    setGlobalDispatcher(agent);
    agent.disableNetConnect();
  });

  it('should fetch token when kind is audio and streamType is simulcast', async () => {
    const mockToken = { token: 'fakeToken123' };
    const endpoint = 'https://rms.api.bbc.co.uk';

    agent
      .get(endpoint)
      .intercept({
        path: '/v2/sign/token/service123',
        method: 'GET'
      })
      .reply(200, mockToken);

    const result = await fetchRMSToken('urn:bbc:pips:pid:service123', 'audio', 'simulcast');
    assert.equal(result, 'fakeToken123');
  });

  it('should skip fetching token when kind is not audio or streamType is not simulcast', async () => {
    const result = await fetchRMSToken('service123', 'video', 'ondemand');
    assert.equal(result, undefined);
  });

  it('should handle a failed request and throw a FetchError', async () => {
    const endpoint = 'https://rms.api.bbc.co.uk';

    agent.get(endpoint).intercept({ path: '/v2/sign/token/service123', method: 'GET' }).reply(500);

    const error = await getError(async () =>
      fetchRMSToken('urn:bbc:pips:pid:service123', 'audio', 'simulcast')
    );

    assert.equal(error instanceof FetchError, true);
    assert.equal(error.message, 'Bad response for RMS token. Status: 500 Internal Server Error.');
  });

  it('should handle a failed JSON parse and throw a FetchError', async () => {
    const endpoint = 'https://rms.api.bbc.co.uk';

    agent
      .get(endpoint)
      .intercept({ path: '/v2/sign/token/service123', method: 'GET' })
      .reply(200, 'not JSON');

    const error = await getError(async () =>
      fetchRMSToken('urn:bbc:pips:pid:service123', 'audio', 'simulcast')
    );

    assert.equal(error instanceof FetchError, true);
    assert.equal(error.message, 'JSON parse failure for RMS token.');
  });
});
