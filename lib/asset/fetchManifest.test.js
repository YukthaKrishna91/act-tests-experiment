import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { fetchManifest } from './fetchManifest.js';
import {
  mockAudio,
  mockMediation,
  mockMediationPath,
  mockVideo,
  SECUREGATE
} from './mockMediation.js';
import {
  mockMediated,
  mockPlaybackAssets as mockAssets,
  mockUnmediated,
  TV_FILES,
  PLAYBACK_ASSETS
} from './mockPlaybackAssets.js';
import { mockToken, mockTokenPath, RMS_API } from './mockRmsApi.js';

/**
 * Integration tests that mock out the network
 */
describe('fetchManifest', () => {
  let agent;

  beforeEach(() => {
    agent = new MockAgent();
    setGlobalDispatcher(agent);
    agent.disableNetConnect();
  });

  it('loads an unmediated h264 stream', async () => {
    agent
      .get(TV_FILES)
      .intercept({ path: PLAYBACK_ASSETS })
      .reply(200, mockAssets(['avc-video', mockUnmediated(['https://mock.cdn/manifest.mpd'])]));

    agent.get('https://mock.cdn').intercept({ path: '/manifest.mpd' }).reply(200, '$$mock');

    assert.deepEqual(await fetchManifest('avc-video'), {
      baseURL: 'https://mock.cdn',
      text: '$$mock'
    });
  });

  it('loads a mediated h264 stream with other available encodings', async () => {
    agent
      .get(TV_FILES)
      .intercept({ path: PLAYBACK_ASSETS })
      .reply(
        200,
        mockAssets(['avc-video', mockMediated('urn:bbc:pips:pid:stubbed', { encoding: 'h264' })])
      );

    agent
      .get(SECUREGATE)
      .intercept({ path: mockMediationPath('urn:bbc:pips:pid:stubbed') })
      .reply(
        200,
        mockMediation(
          mockVideo(['https://mock.cdn/h264/manifest.mpd'], { encoding: 'h264', dpw: 1 }),
          mockVideo(['https://mock.cdn/h265/manifest.mpd'], { encoding: 'h265', dpw: 100 })
        )
      );

    agent.get('https://mock.cdn').intercept({ path: '/h264/manifest.mpd' }).reply(200, '$$mock');

    assert.deepEqual(await fetchManifest('avc-video'), {
      baseURL: 'https://mock.cdn/h264',
      text: '$$mock'
    });
  });

  it('loads a mediated h265 stream with other available encodings', async () => {
    agent
      .get(TV_FILES)
      .intercept({ path: PLAYBACK_ASSETS })
      .reply(
        200,
        mockAssets(['hevc-video', mockMediated('urn:bbc:pips:pid:stubbed', { encoding: 'h265' })])
      );

    agent
      .get(SECUREGATE)
      .intercept({ path: mockMediationPath('urn:bbc:pips:pid:stubbed') })
      .reply(
        200,
        mockMediation(
          mockVideo(['https://mock.cdn/h264/manifest.mpd'], { encoding: 'h264', dpw: 100 }),
          mockVideo(['https://mock.cdn/h265/manifest.mpd'], { encoding: 'h265', dpw: 1 })
        )
      );

    agent.get('https://mock.cdn').intercept({ path: '/h265/manifest.mpd' }).reply(200, '$$mock');

    assert.deepEqual(await fetchManifest('hevc-video'), {
      baseURL: 'https://mock.cdn/h265',
      text: '$$mock'
    });
  });

  it('loads a mediated AAC stream with a JWT token', async () => {
    agent
      .get(TV_FILES)
      .intercept({ path: PLAYBACK_ASSETS })
      .reply(
        200,
        mockAssets([
          'aac-audio',
          mockMediated('urn:bbc:pips:pid:stubbed', {
            kind: 'audio',
            encoding: 'aac',
            streamType: 'simulcast'
          })
        ])
      );

    agent
      .get(RMS_API)
      .intercept({ path: mockTokenPath('urn:bbc:pips:pid:stubbed') })
      .reply(200, mockToken('mock.jwt'));

    agent
      .get(SECUREGATE)
      .intercept({
        path: mockMediationPath('urn:bbc:pips:pid:stubbed'),
        query: { jwt_auth: 'mock.jwt' }
      })
      .reply(200, mockMediation(mockAudio(['https://mock.cdn/aac/manifest.mpd'])));

    agent.get('https://mock.cdn').intercept({ path: '/aac/manifest.mpd' }).reply(200, '$$mock');

    assert.deepEqual(await fetchManifest('aac-audio'), {
      baseURL: 'https://mock.cdn/aac',
      text: '$$mock'
    });
  });
});
