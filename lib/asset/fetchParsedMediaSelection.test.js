import assert from 'node:assert/strict';
import { before, beforeEach, describe, it, mock } from 'node:test';
import { MockAgent, setGlobalDispatcher } from 'undici';

import { getError } from '../error/getError.js';
import { FetchError } from '../error/FetchError.js';

describe('fetchParsedMediaSelection', () => {
  const parseMediaSelectionMock = mock.fn();

  let agent;
  let fetchParsedMediaSelection;

  before(async () => {
    mock.module('./parseMediaSelection.js', {
      namedExports: { parseMediaSelection: parseMediaSelectionMock }
    });

    ({ fetchParsedMediaSelection } = await import('./fetchParsedMediaSelection.js'));
  });

  beforeEach(() => {
    parseMediaSelectionMock.mock.resetCalls();

    agent = new MockAgent();
    setGlobalDispatcher(agent);
    agent.disableNetConnect();
  });

  describe('formats Media Selector request URL', () => {
    const mediaTestCases = [
      {
        mediatorUrl: 'https://mediator.example.co.uk/',
        media: {
          cvid: 'urn:bbc:pips:pid:vpid',
          kind: 'video',
          playbackQuality: 'hd',
          encoding: 'h264',
          jwt: 'token'
        },
        expectedUrl: 'https://mediator.example.co.uk',
        expectedData: {
          kind: 'video',
          type: 'application/dash+xml',
          transferFormat: 'dash',
          mediaSet: 'iptv-mse',
          urls: [{ href: 'http://example.com' }],
          captions: [{ href: 'http://example.com' }],
          audioDescribed: [{ href: 'http://example.com' }],
          thumbnails: [{ href: 'http://example.com' }]
        }
      },
      {
        mediatorUrl: 'https://mediator.example.co.uk/',
        media: {
          cvid: 'urn:bbc:pips:pid:vpid',
          kind: 'video',
          playbackQuality: 'uhd',
          encoding: 'h265',
          jwt: undefined
        },
        expectedUrl: 'https://mediator.example.co.uk',
        expectedData: {
          kind: 'video',
          type: 'application/dash+xml',
          transferFormat: 'dash',
          mediaSet: 'iptv-uhd',
          urls: [{ href: 'http://example.com' }],
          captions: [{ href: 'http://example.com' }],
          audioDescribed: [{ href: 'http://example.com' }],
          thumbnails: [{ href: 'http://example.com' }]
        }
      }
    ];

    mediaTestCases.forEach(({ mediatorUrl, media, expectedUrl, expectedData }) => {
      it(`formats the URL for media with ${expectedData.mediaSet} mediaSet ${media.jwt ? 'and a JWT' : 'and no JWT'}`, async () => {
        agent
          .get(expectedUrl)
          .intercept({
            path: `/mediaselector/6/select/version/3.0/mediaset/${expectedData.mediaSet}/cvid/urn:bbc:pips:pid:vpid/format/json/cors/1/proto/https${media.jwt ? `?jwt_auth=${media.jwt}` : ''}`,
            method: 'GET'
          })
          .reply(200, { test: 'data' });

        parseMediaSelectionMock.mock.mockImplementationOnce(() => Promise.resolve(expectedData));

        const result = await fetchParsedMediaSelection(mediatorUrl, media);
        assert.deepEqual(result, expectedData);
      });
    });
  });

  describe('fetching Media Selector', () => {
    it('throws a FetchError when fetching fails', async () => {
      const mediatorUrl = 'https://mediator.example.co.uk/';
      const media = {
        cvid: 'urn:bbc:pips:pid:vpid',
        kind: 'video',
        playbackQuality: 'hd',
        jwt: undefined
      };

      agent
        .get('https://mediator.example.co.uk')
        .intercept({
          path: '/mediaselector/6/select/version/3.0/mediaset/iptv-mse/cvid/urn:bbc:pips:pid:vpid/format/json/cors/1/proto/https',
          method: 'GET'
        })
        .reply(500);

      const error = await getError(async () => fetchParsedMediaSelection(mediatorUrl, media));
      assert.equal(error instanceof FetchError, true);
      assert.equal(
        error.message,
        'Bad response for media selector URL: https://mediator.example.co.uk/mediaselector/6/select/version/3.0/mediaset/iptv-mse/cvid/urn:bbc:pips:pid:vpid/format/json/cors/1/proto/https. Status: 500 Internal Server Error.'
      );
    });

    it('throws a FetchError when parsing JSON fails', async () => {
      const mediatorUrl = 'https://mediator.example.co.uk/';
      const media = {
        cvid: 'urn:bbc:pips:pid:vpid',
        kind: 'video',
        playbackQuality: 'hd',
        jwt: undefined
      };

      agent
        .get('https://mediator.example.co.uk')
        .intercept({
          path: '/mediaselector/6/select/version/3.0/mediaset/iptv-mse/cvid/urn:bbc:pips:pid:vpid/format/json/cors/1/proto/https',
          method: 'GET'
        })
        .reply(200, 'Not JSON');

      const error = await getError(async () => fetchParsedMediaSelection(mediatorUrl, media));
      assert.equal(error instanceof FetchError, true);
      assert.equal(
        error.message,
        'JSON parse failure for media selector URL: https://mediator.example.co.uk/mediaselector/6/select/version/3.0/mediaset/iptv-mse/cvid/urn:bbc:pips:pid:vpid/format/json/cors/1/proto/https.'
      );
    });
  });

  it('returns a valid media selection', async () => {
    const mediatorUrl = 'https://mediator.example.co.uk/';
    const media = {
      cvid: 'urn:bbc:pips:pid:vpid',
      kind: 'video',
      playbackQuality: 'hd',
      jwt: undefined
    };

    const parsedData = {
      kind: media.kind,
      type: 'application/dash+xml',
      transferFormat: 'dash',
      mediaSet: 'iptv-mse',
      urls: [{ href: 'http://example.com' }],
      captions: [{ href: 'http://example.com' }],
      audioDescribed: [{ href: 'http://example.com' }],
      thumbnails: [{ href: 'http://example.com' }]
    };

    agent
      .get('https://mediator.example.co.uk')
      .intercept({
        path: '/mediaselector/6/select/version/3.0/mediaset/iptv-mse/cvid/urn:bbc:pips:pid:vpid/format/json/cors/1/proto/https',
        method: 'GET'
      })
      .reply(200, { test: 'data' });

    parseMediaSelectionMock.mock.mockImplementationOnce(() => Promise.resolve(parsedData));

    const result = await fetchParsedMediaSelection(mediatorUrl, media);
    assert.deepEqual(result, parsedData);
  });
});
