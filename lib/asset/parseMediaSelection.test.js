import assert from 'node:assert/strict';
import { before, beforeEach, describe, it, mock } from 'node:test';
import { getError } from '../error/getError.js';

const smpParseMock = mock.fn();

let parseMediaSelection;
let ParseError;

describe('parseMediaSelection', () => {
  before(async () => {
    mock.module('@bbc/smp-media-selector', {
      namedExports: {
        parse: smpParseMock
      }
    });
    ({ parseMediaSelection, ParseError } = await import('./parseMediaSelection.js'));
  });

  beforeEach(() => {
    smpParseMock.mock.resetCalls();
  });

  it('should call parse and handle error result correctly', async () => {
    smpParseMock.mock.mockImplementationOnce(() => ({ result: null, error: 'Invalid format' }));
    const error = await getError(() => {
      parseMediaSelection({}, { kind: 'video', mediaSet: 'test' });
    });
    assert.equal(error instanceof ParseError, true);
    assert.equal(error.message, 'Failed to parse media selection: Invalid format');
  });

  it('should throw MediaSelectorParseError if parse throws', async () => {
    smpParseMock.mock.mockImplementationOnce(() => {
      throw new Error('Boom');
    });

    const error = await getError(() => {
      parseMediaSelection({}, { kind: 'audio', mediaSet: 'test' });
    });

    assert.equal(error instanceof ParseError, true);
    assert.equal(error.message, 'Failed to parse media selection');
  });

  it('should return correct structure with all fields', () => {
    smpParseMock.mock.mockImplementationOnce(() => ({
      result: {
        video: [
          {
            href: 'https://cdn.example.com/stream.mpd',
            supplier: 'akamai',
            dpw: '100'
          }
        ]
      },
      error: null
    }));

    const result = parseMediaSelection({}, { kind: 'video', mediaSet: 'my-media-set' });

    assert.deepEqual(result, {
      kind: 'video',
      type: 'application/dash+xml',
      transferFormat: 'dash',
      mediaSet: 'my-media-set',
      urls: [{ cdn: 'akamai', dpw: 100, url: 'https://cdn.example.com/stream.mpd' }]
    });
  });

  it('should parse the specified encoding for video', () => {
    smpParseMock.mock.mockImplementationOnce(() => ({
      result: {
        video: [
          {
            href: 'https://cdn.example.com/stream.mpd',
            supplier: 'akamai',
            dpw: '100'
          }
        ]
      },
      error: null
    }));

    const result = parseMediaSelection(
      {},
      { kind: 'video', mediaSet: 'my-media-set', encoding: 'h265' }
    );

    assert.deepEqual(smpParseMock.mock.calls[0].arguments, [
      {},
      { protocols: ['https'], transferFormats: ['dash'], encodings: { video: ['h265'] } }
    ]);

    assert.deepEqual(result.urls, [
      { cdn: 'akamai', dpw: 100, url: 'https://cdn.example.com/stream.mpd' }
    ]);
  });

  it('should parse the specified encoding for audio', () => {
    smpParseMock.mock.mockImplementationOnce(() => ({
      result: {
        audio: [
          {
            href: 'https://cdn.example.com/stream.mpd',
            supplier: 'akamai',
            dpw: '100'
          }
        ]
      },
      error: null
    }));

    const result = parseMediaSelection(
      {},
      { kind: 'audio', mediaSet: 'my-media-set', encoding: 'aac' }
    );

    assert.deepEqual(smpParseMock.mock.calls[0].arguments, [
      {},
      { protocols: ['https'], transferFormats: ['dash'], encodings: { audio: ['aac'] } }
    ]);

    assert.deepEqual(result.urls, [
      { cdn: 'akamai', dpw: 100, url: 'https://cdn.example.com/stream.mpd' }
    ]);
  });

  describe('formatConnections', () => {
    it('should transform href to url, supplier to cdn, and parse dpw as integer', () => {
      smpParseMock.mock.mockImplementationOnce(() => ({
        result: {
          video: [
            {
              href: 'https://cdn.example.com/stream.mpd',
              supplier: 'akamai',
              dpw: '100',
              bitrate: 1000
            }
          ]
        },
        error: null
      }));

      const result = parseMediaSelection({}, { kind: 'video', mediaSet: 'test' });

      assert.equal(result.urls[0].url, 'https://cdn.example.com/stream.mpd');
      assert.equal(result.urls[0].cdn, 'akamai');
      assert.equal(result.urls[0].dpw, 100);
      assert.equal(result.urls[0].bitrate, 1000);
      assert.equal(result.urls[0].href, undefined);
      assert.equal(result.urls[0].supplier, undefined);
    });

    it('should handle multiple connections', () => {
      smpParseMock.mock.mockImplementationOnce(() => ({
        result: {
          video: [
            { href: 'https://cdn1.example.com/stream.mpd', supplier: 'akamai', dpw: '100' },
            { href: 'https://cdn2.example.com/stream.mpd', supplier: 'cloudfront', dpw: '50' }
          ]
        },
        error: null
      }));

      const result = parseMediaSelection({}, { kind: 'video', mediaSet: 'test' });

      assert.equal(result.urls.length, 2);
      assert.equal(result.urls[0].cdn, 'akamai');
      assert.equal(result.urls[1].cdn, 'cloudfront');
    });

    it('should work for both video and audio kinds', () => {
      smpParseMock.mock.mockImplementationOnce(() => ({
        result: {
          audio: [{ href: 'https://cdn.example.com/audio.mpd', supplier: 'akamai', dpw: '80' }]
        },
        error: null
      }));

      const result = parseMediaSelection({}, { kind: 'audio', mediaSet: 'test' });

      assert.equal(result.urls[0].url, 'https://cdn.example.com/audio.mpd');
      assert.equal(result.urls[0].cdn, 'akamai');
    });

    it('should return undefined when connections is null or undefined', () => {
      smpParseMock.mock.mockImplementationOnce(() => ({
        result: { video: null },
        error: null
      }));

      const result = parseMediaSelection({}, { kind: 'video', mediaSet: 'test' });
      assert.equal(result.urls, undefined);
    });

    it('should handle empty connections array', () => {
      smpParseMock.mock.mockImplementationOnce(() => ({
        result: { video: [] },
        error: null
      }));

      const result = parseMediaSelection({}, { kind: 'video', mediaSet: 'test' });
      assert.deepEqual(result.urls, []);
    });
  });
});
