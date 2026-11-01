import assert from 'node:assert/strict';
import { before, beforeEach, describe, it, mock } from 'node:test';
import { JSDOM } from 'jsdom';
import { getError } from '../error/getError.js';

const SAMPLE_MPD = `<?xml version="1.0" encoding="utf-8"?>
<MPD
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns="urn:mpeg:dash:schema:mpd:2011"
  xsi:schemaLocation="urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd">
  <Period>
    <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
      <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
        <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
      </Representation>
    </AdaptationSet>
  </Period>
</MPD>
`;

function getManifestDocument(xmlString) {
  const { DOMParser } = new JSDOM().window;
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'text/xml');
}

const createSegmentTemplateMock = mock.fn(
  ({ baseUrl, initTemplate, mediaTemplate, representationId, duration }) => {
    return {
      getInitSegmentURL: () =>
        `${baseUrl}${initTemplate.replace('$RepresentationID$', representationId)}`,
      getMediaSegmentURL: (n) =>
        `${baseUrl}${mediaTemplate.replace('$Number$', n).replace('$RepresentationID$', representationId)}`,
      duration
    };
  }
);

let createSegmentTemplateFromManifest;

before(async () => {
  mock.module('./SegmentTemplate.js', {
    namedExports: { createSegmentTemplate: createSegmentTemplateMock }
  });

  ({ createSegmentTemplateFromManifest } = await import('./createSegmentTemplateFromManifest.js'));
});

beforeEach(() => {
  createSegmentTemplateMock.mock.resetCalls();
});

describe('createSegmentTemplateFromManifest', () => {
  describe('successful matches', () => {
    it('returns segment template when all attributes match', () => {
      const doc = getManifestDocument(SAMPLE_MPD);
      const result = createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
        mediaKind: 'video',
        codecs: 'avc1.4d401f',
        sampleRate: '30',
        bandwidth: '1000000',
        width: '1920',
        height: '1080'
      });

      assert.notEqual(result, null);
      assert.equal(result.getInitSegmentURL(), 'https://example.com/segments/init-v1.mp4');
      assert.equal(result.getMediaSegmentURL('1'), 'https://example.com/segments/segment-1.m4s');
    });

    it('allows optional parameters to be undefined', () => {
      const doc = getManifestDocument(SAMPLE_MPD);
      const result = createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
        mediaKind: 'video',
        bandwidth: '1000000'
      });

      assert.notEqual(result, null);
    });

    it('coerces numeric parameters to strings', () => {
      const doc = getManifestDocument(SAMPLE_MPD);
      const result = createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
        mediaKind: 'video',
        codecs: 'avc1.4d401f',
        sampleRate: 30,
        bandwidth: 1000000,
        width: 1920,
        height: 1080
      });

      assert.notEqual(result, null);
    });

    it('selects correct representation when multiple exist', () => {
      const MPD_MULTI_REP = `
        <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
          <Period>
            <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
              <Representation id="v1" bandwidth="500000" width="1280" height="720" frameRate="30">
                <SegmentTemplate duration="2" media="segment-low-$Number$.m4s" initialization="init-low.mp4"/>
              </Representation>
              <Representation id="v2" bandwidth="1000000" width="1920" height="1080" frameRate="30">
                <SegmentTemplate duration="2" media="segment-high-$Number$.m4s" initialization="init-high.mp4"/>
              </Representation>
            </AdaptationSet>
          </Period>
        </MPD>
      `;
      const doc = getManifestDocument(MPD_MULTI_REP);
      const result = createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
        mediaKind: 'video',
        codecs: 'avc1.4d401f',
        sampleRate: '30',
        bandwidth: '1000000',
        width: '1920',
        height: '1080'
      });

      assert.notEqual(result, null);
      assert.equal(
        result.getMediaSegmentURL('1'),
        'https://example.com/segments/segment-high-1.m4s'
      );
    });
  });

  describe('attribute inheritance', () => {
    it('matches representation when codecs is on AdaptationSet', () => {
      const MPD_AS_CODEC = `
        <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
          <Period>
            <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
              <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
                <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
              </Representation>
            </AdaptationSet>
          </Period>
        </MPD>
      `;
      const doc = getManifestDocument(MPD_AS_CODEC);
      const result = createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
        mediaKind: 'video',
        codecs: 'avc1.4d401f',
        sampleRate: '30',
        bandwidth: '1000000',
        width: '1920',
        height: '1080'
      });

      assert.notEqual(result, null);
    });

    it('matches representation when frameRate is on AdaptationSet', () => {
      const MPD_AS_FRAMERATE = `
        <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
          <Period>
            <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f" frameRate="30">
              <Representation id="v1" bandwidth="1000000" width="1920" height="1080">
                <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
              </Representation>
            </AdaptationSet>
          </Period>
        </MPD>
      `;
      const doc = getManifestDocument(MPD_AS_FRAMERATE);
      const result = createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
        mediaKind: 'video',
        codecs: 'avc1.4d401f',
        sampleRate: '30',
        bandwidth: '1000000',
        width: '1920',
        height: '1080'
      });

      assert.notEqual(result, null);
    });
  });

  describe('SegmentTemplate inheritance', () => {
    it('finds SegmentTemplate on Representation', () => {
      const doc = getManifestDocument(SAMPLE_MPD);
      const result = createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
        mediaKind: 'video',
        codecs: 'avc1.4d401f',
        sampleRate: '30',
        bandwidth: '1000000',
        width: '1920',
        height: '1080'
      });

      assert.notEqual(result, null);
      assert.equal(result.getInitSegmentURL(), 'https://example.com/segments/init-v1.mp4');
    });

    it('finds SegmentTemplate on AdaptationSet', () => {
      const MPD_AS_TEMPLATE = `
        <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
          <Period>
            <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
              <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
              <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
              </Representation>
            </AdaptationSet>
          </Period>
        </MPD>
      `;
      const doc = getManifestDocument(MPD_AS_TEMPLATE);
      const result = createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
        mediaKind: 'video',
        codecs: 'avc1.4d401f',
        sampleRate: '30',
        bandwidth: '1000000',
        width: '1920',
        height: '1080'
      });

      assert.notEqual(result, null);
      assert.equal(result.getInitSegmentURL(), 'https://example.com/segments/init-v1.mp4');
    });

    it('finds SegmentTemplate on Period', () => {
      const MPD_PERIOD_TEMPLATE = `
        <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
          <Period>
            <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
            <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
              <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
              </Representation>
            </AdaptationSet>
          </Period>
        </MPD>
      `;
      const doc = getManifestDocument(MPD_PERIOD_TEMPLATE);
      const result = createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
        mediaKind: 'video',
        codecs: 'avc1.4d401f',
        sampleRate: '30',
        bandwidth: '1000000',
        width: '1920',
        height: '1080'
      });

      assert.notEqual(result, null);
    });

    it('throws when no SegmentTemplate found', async () => {
      const MPD_NO_TEMPLATE = `
        <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
          <Period>
            <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
              <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
              </Representation>
            </AdaptationSet>
          </Period>
        </MPD>
      `;
      const doc = getManifestDocument(MPD_NO_TEMPLATE);

      const error = await getError(() =>
        createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
          mediaKind: 'video',
          codecs: 'avc1.4d401f',
          sampleRate: '30',
          bandwidth: '1000000',
          width: '1920',
          height: '1080'
        })
      );

      assert.equal(error.name, 'Error');
      assert.equal(error.message, 'Failed to find a representation matching the criteria.');
      assert.deepEqual(error.cause, {
        mediaKind: 'video',
        codecs: 'avc1.4d401f',
        sampleRate: '30',
        bandwidth: '1000000',
        width: '1920',
        height: '1080'
      });
    });
  });

  describe('segment duration calculation', () => {
    it('calculates duration in seconds when timescale is provided', () => {
      const MPD_WITH_TIMESCALE = `
        <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
          <Period>
            <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
              <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
                <SegmentTemplate duration="9000" timescale="90000" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
              </Representation>
            </AdaptationSet>
          </Period>
        </MPD>
      `;
      const doc = getManifestDocument(MPD_WITH_TIMESCALE);
      const result = createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
        mediaKind: 'video',
        bandwidth: '1000000'
      });

      assert.notEqual(result, null);
      assert.equal(createSegmentTemplateMock.mock.calls[0].arguments[0].duration, 0.1);
    });

    it('calculates duration correctly with timescale=1000', () => {
      const MPD_TIMESCALE_1000 = `
        <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
          <Period>
            <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
              <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
                <SegmentTemplate duration="2000" timescale="1000" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
              </Representation>
            </AdaptationSet>
          </Period>
        </MPD>
      `;
      const doc = getManifestDocument(MPD_TIMESCALE_1000);
      const result = createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
        mediaKind: 'video',
        bandwidth: '1000000'
      });

      assert.notEqual(result, null);
      assert.equal(createSegmentTemplateMock.mock.calls[0].arguments[0].duration, 2);
    });

    it('handles fractional duration results', () => {
      const MPD_FRACTIONAL = `
        <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
          <Period>
            <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
              <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
                <SegmentTemplate duration="48000" timescale="48000" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
              </Representation>
            </AdaptationSet>
          </Period>
        </MPD>
      `;
      const doc = getManifestDocument(MPD_FRACTIONAL);
      const result = createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
        mediaKind: 'video',
        bandwidth: '1000000'
      });

      assert.notEqual(result, null);
      assert.equal(createSegmentTemplateMock.mock.calls[0].arguments[0].duration, 1);
    });
  });

  describe('BaseURL resolution', () => {
    it('uses manifestBaseURL when no BaseURL elements exist', () => {
      const doc = getManifestDocument(SAMPLE_MPD);
      const result = createSegmentTemplateFromManifest(doc, 'https://cdn.example.com/content', {
        mediaKind: 'video',
        bandwidth: '1000000'
      });

      assert.notEqual(result, null);
      assert.equal(result.getInitSegmentURL(), 'https://cdn.example.com/content/init-v1.mp4');
    });

    it('resolves BaseURL at each hierarchy level', () => {
      const testCases = [
        {
          name: 'MPD level',
          baseURLLocation: 'MPD',
          expectedPath: 'https://cdn.example.com/videos/init-v1.mp4'
        },
        {
          name: 'Period level',
          baseURLLocation: 'Period',
          expectedPath: 'https://cdn.example.com/period1/init-v1.mp4'
        },
        {
          name: 'AdaptationSet level',
          baseURLLocation: 'AdaptationSet',
          expectedPath: 'https://cdn.example.com/video-high/init-v1.mp4'
        },
        {
          name: 'Representation level',
          baseURLLocation: 'Representation',
          expectedPath: 'https://cdn.example.com/1080p/init-v1.mp4'
        }
      ];

      const baseURLValues = {
        MPD: 'videos/',
        Period: 'period1/',
        AdaptationSet: 'video-high/',
        Representation: '1080p/'
      };

      testCases.forEach(({ name, baseURLLocation, expectedPath }) => {
        const mpdWithBaseURL = `
          <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
            ${baseURLLocation === 'MPD' ? `<BaseURL>${baseURLValues.MPD}</BaseURL>` : ''}
            <Period>
              ${baseURLLocation === 'Period' ? `<BaseURL>${baseURLValues.Period}</BaseURL>` : ''}
              <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
                ${baseURLLocation === 'AdaptationSet' ? `<BaseURL>${baseURLValues.AdaptationSet}</BaseURL>` : ''}
                <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
                  ${baseURLLocation === 'Representation' ? `<BaseURL>${baseURLValues.Representation}</BaseURL>` : ''}
                  <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
                </Representation>
              </AdaptationSet>
            </Period>
          </MPD>
        `;

        const doc = getManifestDocument(mpdWithBaseURL);
        const result = createSegmentTemplateFromManifest(doc, 'https://cdn.example.com', {
          mediaKind: 'video',
          bandwidth: '1000000'
        });

        assert.notEqual(result, null);
        assert.equal(result.getInitSegmentURL(), expectedPath, `${name} should resolve correctly`);
      });
    });

    it('concatenates multiple BaseURL elements in hierarchy', () => {
      const MPD_MULTI_BASEURL = `
        <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
          <BaseURL>content/</BaseURL>
          <Period>
            <BaseURL>live/</BaseURL>
            <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
              <BaseURL>video/</BaseURL>
              <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
                <BaseURL>hd/</BaseURL>
                <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
              </Representation>
            </AdaptationSet>
          </Period>
        </MPD>
      `;
      const doc = getManifestDocument(MPD_MULTI_BASEURL);
      const result = createSegmentTemplateFromManifest(doc, 'https://cdn.example.com', {
        mediaKind: 'video',
        bandwidth: '1000000'
      });

      assert.notEqual(result, null);
      assert.equal(
        result.getInitSegmentURL(),
        'https://cdn.example.com/content/live/video/hd/init-v1.mp4'
      );
    });

    it('handles BaseURL with a leading and trailing slash', () => {
      const mpd = `
          <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
            <BaseURL>/videos/</BaseURL>
            <Period>
              <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
                <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
                  <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
                </Representation>
              </AdaptationSet>
            </Period>
          </MPD>
        `;

      const doc = getManifestDocument(mpd);
      const result = createSegmentTemplateFromManifest(doc, 'https://cdn.example.com', {
        mediaKind: 'video',
        bandwidth: '1000000'
      });

      assert.notEqual(result, null);
      assert.equal(result.getInitSegmentURL(), 'https://cdn.example.com/videos/init-v1.mp4');
    });

    it('handles absolute BaseURLs', () => {
      const mpd = `
          <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
            <Period>
              <BaseURL>https://mock.cdn.net/live/uk/bbc_radio_two/bbc_radio_two.isml/dash/</BaseURL>
              <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
                <BaseURL>video/</BaseURL>
                <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
                  <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
                </Representation>
              </AdaptationSet>
            </Period>
          </MPD>
        `;

      const doc = getManifestDocument(mpd);
      const result = createSegmentTemplateFromManifest(doc, 'https://cdn.example.com', {
        mediaKind: 'video',
        bandwidth: '1000000'
      });

      assert.notEqual(result, null);
      assert.equal(
        result.getInitSegmentURL(),
        'https://mock.cdn.net/live/uk/bbc_radio_two/bbc_radio_two.isml/dash/video/init-v1.mp4'
      );
    });
  });

  describe('video validation', () => {
    it('throws when bandwidth does not match', async () => {
      const doc = getManifestDocument(SAMPLE_MPD);

      const error = await getError(() =>
        createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
          mediaKind: 'video',
          codecs: 'avc1.4d401f',
          sampleRate: '30',
          bandwidth: '999999',
          width: '1920',
          height: '1080'
        })
      );

      assert.equal(error.name, 'Error');
      assert.equal(error.message, 'Failed to find a representation matching the criteria.');
      assert.deepEqual(error.cause, {
        mediaKind: 'video',
        codecs: 'avc1.4d401f',
        sampleRate: '30',
        bandwidth: '999999',
        width: '1920',
        height: '1080'
      });
    });

    it('throws when codecs does not match', async () => {
      const doc = getManifestDocument(SAMPLE_MPD);

      const error = await getError(() =>
        createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
          mediaKind: 'video',
          codecs: 'badcodec',
          sampleRate: '30',
          bandwidth: '1000000',
          width: '1920',
          height: '1080'
        })
      );

      assert.equal(error.name, 'Error');
      assert.equal(error.message, 'Failed to find a representation matching the criteria.');
      assert.deepEqual(error.cause, {
        mediaKind: 'video',
        codecs: 'badcodec',
        sampleRate: '30',
        bandwidth: '1000000',
        width: '1920',
        height: '1080'
      });
    });

    it('throws when width does not match', async () => {
      const doc = getManifestDocument(SAMPLE_MPD);

      const error = await getError(() =>
        createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
          mediaKind: 'video',
          codecs: 'avc1.4d401f',
          sampleRate: '30',
          bandwidth: '1000000',
          width: '1280',
          height: '1080'
        })
      );

      assert.equal(error.name, 'Error');
      assert.equal(error.message, 'Failed to find a representation matching the criteria.');
      assert.deepEqual(error.cause, {
        mediaKind: 'video',
        codecs: 'avc1.4d401f',
        sampleRate: '30',
        bandwidth: '1000000',
        width: '1280',
        height: '1080'
      });
    });

    it('throws when height does not match', async () => {
      const doc = getManifestDocument(SAMPLE_MPD);

      const error = await getError(() =>
        createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
          mediaKind: 'video',
          codecs: 'avc1.4d401f',
          sampleRate: '30',
          bandwidth: '1000000',
          width: '1920',
          height: '720'
        })
      );

      assert.equal(error.name, 'Error');
      assert.equal(error.message, 'Failed to find a representation matching the criteria.');
      assert.deepEqual(error.cause, {
        mediaKind: 'video',
        codecs: 'avc1.4d401f',
        sampleRate: '30',
        bandwidth: '1000000',
        width: '1920',
        height: '720'
      });
    });

    it('throws when sampleRate does not match for video', async () => {
      const doc = getManifestDocument(SAMPLE_MPD);

      const error = await getError(() =>
        createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
          mediaKind: 'video',
          codecs: 'avc1.4d401f',
          sampleRate: '60',
          bandwidth: '1000000',
          width: '1920',
          height: '1080'
        })
      );

      assert.equal(error.name, 'Error');
      assert.equal(error.message, 'Failed to find a representation matching the criteria.');
      assert.deepEqual(error.cause, {
        mediaKind: 'video',
        codecs: 'avc1.4d401f',
        sampleRate: '60',
        bandwidth: '1000000',
        width: '1920',
        height: '1080'
      });
    });
  });

  describe('audio validation', () => {
    it('handles audio adaptation sets with audioSamplingRate', () => {
      const MPD_AUDIO = `
        <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
          <Period>
            <AdaptationSet contentType="audio" mimeType="audio/mp4" codecs="mp4a.40.2">
              <Representation id="a1" bandwidth="128000" audioSamplingRate="48000">
                <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
              </Representation>
            </AdaptationSet>
          </Period>
        </MPD>
      `;
      const doc = getManifestDocument(MPD_AUDIO);

      const result = createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
        mediaKind: 'audio',
        codecs: 'mp4a.40.2',
        sampleRate: '48000',
        bandwidth: '128000'
      });

      assert.notEqual(result, null);
    });

    it('throws when audioSamplingRate does not match', async () => {
      const MPD_AUDIO = `
        <MPD xmlns="urn:mpeg:dash:schema:mpd:2011">
          <Period>
            <AdaptationSet contentType="audio" mimeType="audio/mp4" codecs="mp4a.40.2">
              <Representation id="a1" bandwidth="128000" audioSamplingRate="48000">
                <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
              </Representation>
            </AdaptationSet>
          </Period>
        </MPD>
      `;

      const doc = getManifestDocument(MPD_AUDIO);

      const error = await getError(() =>
        createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
          mediaKind: 'audio',
          codecs: 'mp4a.40.2',
          sampleRate: '44100',
          bandwidth: '128000'
        })
      );

      assert.equal(error.name, 'Error');
      assert.equal(error.message, 'Failed to find a representation matching the criteria.');
      assert.deepEqual(error.cause, {
        mediaKind: 'audio',
        codecs: 'mp4a.40.2',
        sampleRate: '44100',
        bandwidth: '128000',
        height: undefined,
        width: undefined
      });
    });
  });

  describe('edge cases', () => {
    it('throws when no AdaptationSet matches mediaKind', async () => {
      const doc = getManifestDocument(SAMPLE_MPD);

      const error = await getError(() =>
        createSegmentTemplateFromManifest(doc, 'https://example.com/segments', {
          mediaKind: 'audio',
          codecs: 'avc1.4d401f',
          sampleRate: '30',
          bandwidth: '1000000'
        })
      );

      assert.equal(error.name, 'Error');
      assert.equal(error.message, 'Failed to find a representation matching the criteria.');
      assert.deepEqual(error.cause, {
        mediaKind: 'audio',
        codecs: 'avc1.4d401f',
        sampleRate: '30',
        bandwidth: '1000000',
        height: undefined,
        width: undefined
      });
    });
  });
});
