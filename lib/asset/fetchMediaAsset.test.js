import assert from 'node:assert/strict';
import { before, beforeEach, describe, it, mock } from 'node:test';

describe('Media Asset Tests', () => {
  const fetchPlaybackAssetMock = mock.fn();
  const fetchRMSTokenMock = mock.fn();
  const fetchParsedMediaSelectionMock = mock.fn();

  let fetchMediaAsset;

  before(async () => {
    mock.module('./fetchPlaybackAsset.js', { defaultExport: fetchPlaybackAssetMock });
    mock.module('./fetchRMSToken.js', { namedExports: { fetchRMSToken: fetchRMSTokenMock } });
    mock.module('./fetchParsedMediaSelection.js', {
      namedExports: { fetchParsedMediaSelection: fetchParsedMediaSelectionMock }
    });

    ({ fetchMediaAsset } = await import('./fetchMediaAsset.js'));
  });

  beforeEach(() => {
    fetchPlaybackAssetMock.mock.resetCalls();
    fetchRMSTokenMock.mock.resetCalls();
    fetchParsedMediaSelectionMock.mock.resetCalls();
  });

  it('should return media object directly if not mediated (no cvid or vpid)', async () => {
    const media = {
      kind: 'audio',
      quality: 'low',
      streamType: 'progressive',
      cvid: null,
      vpid: null
    };

    fetchPlaybackAssetMock.mock.mockImplementationOnce(() =>
      Promise.resolve({
        media
      })
    );

    const result = await fetchMediaAsset('plain-id');
    assert.deepEqual(result, media);
  });

  it('should fetch RMS token and media selector if asset is mediated', async () => {
    const media = {
      kind: 'audio',
      quality: 'high',
      streamType: 'dash',
      encoding: 'aac',
      cvid: 'urn:bbc:pips:pid:xyz',
      vpid: null
    };

    const mediatorUrl = 'https://mediator.example.com';

    fetchPlaybackAssetMock.mock.mockImplementationOnce(() =>
      Promise.resolve({ media, mediatorUrl })
    );

    fetchRMSTokenMock.mock.mockImplementationOnce(() => Promise.resolve('abc.jwt.token'));

    const mediaSelectionResult = { kind: 'audio', src: 'media.mpd' };
    fetchParsedMediaSelectionMock.mock.mockImplementationOnce(() =>
      Promise.resolve(mediaSelectionResult)
    );

    const result = await fetchMediaAsset('mediated-id');

    assert.deepEqual(result, mediaSelectionResult);
    assert.deepEqual(fetchRMSTokenMock.mock.calls[0].arguments, [
      'urn:bbc:pips:pid:xyz',
      media.kind,
      media.streamType
    ]);
    assert.deepEqual(fetchParsedMediaSelectionMock.mock.calls[0].arguments[0], mediatorUrl);
    assert.deepEqual(fetchParsedMediaSelectionMock.mock.calls[0].arguments[1], {
      cvid: media.cvid,
      playbackQuality: media.quality,
      kind: media.kind,
      encoding: 'aac',
      jwt: 'abc.jwt.token'
    });
  });

  it('should compute cvid from vpid if cvid is null', async () => {
    const media = {
      kind: 'video',
      quality: 'high',
      streamType: 'dash',
      cvid: null,
      vpid: 'p1234567'
    };

    const mediatorUrl = 'https://mediator.example.com';

    fetchPlaybackAssetMock.mock.mockImplementationOnce(() =>
      Promise.resolve({ media, mediatorUrl })
    );

    fetchRMSTokenMock.mock.mockImplementationOnce(() => Promise.resolve('jwt.token'));

    const mediaSelectionResult = { kind: 'video', src: 'video.mpd' };
    fetchParsedMediaSelectionMock.mock.mockImplementationOnce(() =>
      Promise.resolve(mediaSelectionResult)
    );

    const result = await fetchMediaAsset('vpid-id');

    assert.deepEqual(result, mediaSelectionResult);

    const callArgs = fetchParsedMediaSelectionMock.mock.calls[0].arguments;
    assert.equal(callArgs[0], 'https://mediator.example.com');
    assert.equal(callArgs[1].cvid, 'urn:bbc:pips:pid:p1234567');
    assert.equal(callArgs[1].jwt, 'jwt.token');
  });

  it('should specify audio encoding mediating an audio asset', async () => {
    fetchPlaybackAssetMock.mock.mockImplementationOnce(() =>
      Promise.resolve({
        media: { kind: 'audio', quality: 'hd', encoding: 'aac', cvid: 'urn:bbc:pips:pid:xyz' }
      })
    );

    fetchRMSTokenMock.mock.mockImplementationOnce(() => Promise.resolve('jwt.token'));

    fetchParsedMediaSelectionMock.mock.mockImplementationOnce(() =>
      Promise.resolve({ kind: 'audio', src: 'audio.mpd' })
    );

    const result = await fetchMediaAsset('some-audio');

    assert.deepEqual(result, { kind: 'audio', src: 'audio.mpd' });

    assert.deepEqual(fetchParsedMediaSelectionMock.mock.calls[0].arguments, [
      'https://securegate.iplayer.bbc.co.uk/',
      {
        kind: 'audio',
        playbackQuality: 'hd',
        encoding: 'aac',
        cvid: 'urn:bbc:pips:pid:xyz',
        jwt: 'jwt.token'
      }
    ]);
  });

  it('should specify video encoding mediating a video asset', async () => {
    fetchPlaybackAssetMock.mock.mockImplementationOnce(() =>
      Promise.resolve({
        media: { kind: 'video', quality: 'hd', encoding: 'h265', cvid: 'urn:bbc:pips:pid:xyz' }
      })
    );

    fetchParsedMediaSelectionMock.mock.mockImplementationOnce(() =>
      Promise.resolve({ kind: 'video', src: 'video.mpd' })
    );

    const result = await fetchMediaAsset('some-audio');

    assert.deepEqual(result, { kind: 'video', src: 'video.mpd' });

    assert.deepEqual(fetchParsedMediaSelectionMock.mock.calls[0].arguments, [
      'https://securegate.iplayer.bbc.co.uk/',
      {
        kind: 'video',
        playbackQuality: 'hd',
        encoding: 'h265',
        cvid: 'urn:bbc:pips:pid:xyz',
        jwt: undefined
      }
    ]);
  });
});
