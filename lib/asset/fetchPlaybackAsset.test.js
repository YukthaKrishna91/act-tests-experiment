import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import { MockAgent, setGlobalDispatcher } from 'undici';

import fetchPlaybackAsset from './fetchPlaybackAsset.js';
import { getError } from '../error/getError.js';
import { FetchError } from '../error/FetchError.js';
import { PLAYBACK_ASSETS, TV_FILES } from './mockPlaybackAssets.js';

describe('fetchPlaybackAsset', () => {
  let agent;

  beforeEach(() => {
    agent = new MockAgent();
    setGlobalDispatcher(agent);
    agent.disableNetConnect();
  });

  it('should return asset data when response is ok and id exists', async () => {
    const assetId = 'abc123';
    const mockData = {
      [assetId]: { title: 'Asset Title', duration: 120 }
    };

    agent.get(TV_FILES).intercept({ path: PLAYBACK_ASSETS, method: 'GET' }).reply(200, mockData);

    const result = await fetchPlaybackAsset(assetId);

    assert.deepEqual(result, mockData[assetId]);
  });

  it('should throw a FetchError if response.ok is false', async () => {
    const assetId = 'abc123';

    agent.get(TV_FILES).intercept({ path: PLAYBACK_ASSETS, method: 'GET' }).reply(500);

    const error = await getError(async () => fetchPlaybackAsset(assetId));

    assert.equal(error instanceof FetchError, true);
    assert.equal(
      error.message,
      'Bad response for asset abc123. Status: 500 Internal Server Error.'
    );
  });

  it('should throw a FetchError if response is not JSON', async () => {
    const assetId = 'abc123';

    agent
      .get(TV_FILES)
      .intercept({ path: PLAYBACK_ASSETS, method: 'GET' })
      .reply(200, 'not a json object');

    const error = await getError(async () => fetchPlaybackAsset(assetId));

    assert.equal(error instanceof FetchError, true);
    assert.equal(error.message, 'JSON parse failure for playback asset abc123.');
  });

  it('should throw an Error if the asset ID does not exist', async () => {
    const assetId = 'abc123';
    const mockData = {
      somethingElse: { exampleId: 'ID data' }
    };

    agent.get(TV_FILES).intercept({ path: PLAYBACK_ASSETS, method: 'GET' }).reply(200, mockData);

    const error = await getError(async () => fetchPlaybackAsset(assetId));

    assert.equal(error instanceof Error, true);
  });
});
