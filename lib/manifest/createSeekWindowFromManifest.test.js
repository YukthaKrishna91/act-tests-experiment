import assert from 'node:assert/strict';
import { before, beforeEach, describe, it, mock } from 'node:test';
import { JSDOM } from 'jsdom';

const ONDEMAND_MPD = `<?xml version="1.0" encoding="utf-8"?>
<MPD
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns="urn:mpeg:dash:schema:mpd:2011"
  xsi:schemaLocation="urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
  type="static"
  mediaPresentationDuration="PT634.566S"
>
  <Period>
    <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
      <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
        <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
      </Representation>
    </AdaptationSet>
  </Period>
</MPD>
`;

const SAMPLE_SIMULCAST_MPD = `<?xml version="1.0" encoding="utf-8"?>
<MPD
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns="urn:mpeg:dash:schema:mpd:2011"
  xsi:schemaLocation="urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
  type="dynamic"
  availabilityStartTime="1970-01-01T00:00:25Z"
  timeShiftBufferDepth="PT2H"
>
  <Period>
    <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
      <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
        <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
      </Representation>
    </AdaptationSet>
  </Period>
</MPD>
`;

const SAMPLE_WEBCAST_MPD = `<?xml version="1.0" encoding="utf-8"?>
<MPD
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns="urn:mpeg:dash:schema:mpd:2011"
  xsi:schemaLocation="urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
  type="dynamic"
  availabilityStartTime="2025-10-28T11:00:01.920Z"
  timeShiftBufferDepth="PT2M"
>
  <Period>
    <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
      <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
        <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
      </Representation>
    </AdaptationSet>
  </Period>
</MPD>
`;

const DYNAMIC_MPD = `<?xml version="1.0" encoding="utf-8"?>
<MPD
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns="urn:mpeg:dash:schema:mpd:2011"
  xsi:schemaLocation="urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
  type="dynamic"
  availabilityStartTime="2025-10-28T11:00:01.920Z"
>
  <Period>
    <AdaptationSet contentType="video" mimeType="video/mp4" codecs="avc1.4d401f">
      <Representation id="v1" bandwidth="1000000" width="1920" height="1080" frameRate="30">
        <SegmentTemplate duration="2" media="segment-$Number$.m4s" initialization="init-$RepresentationID$.mp4"/>
      </Representation>
    </AdaptationSet>
  </Period>
</MPD>
`;

function parseManifest(xmlString) {
  const { DOMParser } = new JSDOM().window;
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'text/xml');
}

/** @type {import("./createSeekWindowFromManifest.js").createSeekWindowFromManifest} */
let createSeekWindowFromManifest;

before(async () => {
  ({ createSeekWindowFromManifest } = await import('./createSeekWindowFromManifest.js'));
});

beforeEach(() => {
  mock.timers.reset();
});

describe('createSeekWindowFromManifest', () => {
  describe('for static manifests', () => {
    it('starts seekable posix range relative to wallclock time', () => {
      mock.timers.enable({ now: Date.parse('2025-11-04 09:00:00') });

      const manifestDocument = parseManifest(ONDEMAND_MPD);

      const durationInSeconds = 634.566;

      const window = createSeekWindowFromManifest(manifestDocument);

      const [seekablePosixStart] = window.seekablePosixRange;

      assert.equal(
        seekablePosixStart,
        Date.parse('2025-11-04 09:00:00') - durationInSeconds * 1000
      );
    });

    it('ends seekable posix range at wallclock time', () => {
      mock.timers.enable({ now: Date.parse('2025-11-04 09:00:00') });

      const manifestDocument = parseManifest(ONDEMAND_MPD);

      const window = createSeekWindowFromManifest(manifestDocument);

      const [, seekablePosixEnd] = window.seekablePosixRange;

      assert.equal(seekablePosixEnd, Date.parse('2025-11-04 09:00:00'));
    });

    it('returns a static seekable range', () => {
      mock.timers.enable({ now: Date.parse('2025-11-04 09:00:00') });

      const manifestDocument = parseManifest(ONDEMAND_MPD);

      const window = createSeekWindowFromManifest(manifestDocument);

      const [seekablePosixStart, seekablePosixEnd] = window.seekablePosixRange;

      const hourInMillis = 3600000;

      mock.timers.tick(hourInMillis);

      const [nextSeekablePosixStart, nextSeekablePosixEnd] = window.seekablePosixRange;

      assert.equal(seekablePosixStart, nextSeekablePosixStart);
      assert.equal(seekablePosixEnd, nextSeekablePosixEnd);
    });

    [
      {
        now: Date.parse('2025-11-04 09:00:00'),
        posixTimeInMillis: Date.parse('2025-11-04 09:00:00'),
        presentationTimeInSeconds: 634.566
      },
      {
        now: Date.parse('2025-11-04 09:00:00'),
        posixTimeInMillis: Date.parse('2025-11-04 09:00:00') - 634566,
        presentationTimeInSeconds: 0
      }
    ].forEach(({ now, posixTimeInMillis, presentationTimeInSeconds }) => {
      it(`converts posix time ${posixTimeInMillis} to presentation time ${presentationTimeInSeconds}`, () => {
        mock.timers.enable({ now });

        const manifestDocument = parseManifest(ONDEMAND_MPD);

        const window = createSeekWindowFromManifest(manifestDocument);

        assert.equal(
          window.getPresentationTimeFromPosixTime(posixTimeInMillis),
          presentationTimeInSeconds
        );
      });
    });
  });

  describe('for dynamic manifests', () => {
    it('starts seekable posix range at availability start time', () => {
      mock.timers.enable({ now: Date.parse('2025-10-28 13:00:00') });

      const manifestDocument = parseManifest(DYNAMIC_MPD);

      const availabilityStartTimeInMillis = Date.parse('2025-10-28T11:00:01.920Z');

      const window = createSeekWindowFromManifest(manifestDocument);

      const [seekablePosixStart] = window.seekablePosixRange;

      assert.equal(seekablePosixStart, availabilityStartTimeInMillis);
    });

    it('ends seekable posix range at wallclock time', () => {
      mock.timers.enable({ now: Date.parse('2025-10-28 13:00:00') });

      const manifestDocument = parseManifest(DYNAMIC_MPD);

      const window = createSeekWindowFromManifest(manifestDocument);

      const [, seekablePosixEnd] = window.seekablePosixRange;

      assert.equal(seekablePosixEnd, Date.parse('2025-10-28 13:00:00'));
    });

    it('returns a static seekable range when the manifest does not contain time shift', () => {
      mock.timers.enable({ now: Date.parse('2025-11-04 09:00:00') });

      const manifestDocument = parseManifest(DYNAMIC_MPD);

      const window = createSeekWindowFromManifest(manifestDocument);

      const [seekablePosixStart, seekablePosixEnd] = window.seekablePosixRange;

      const hourInMillis = 3600000;

      mock.timers.tick(hourInMillis);

      const [nextSeekablePosixStart, nextSeekablePosixEnd] = window.seekablePosixRange;

      assert.equal(seekablePosixStart, nextSeekablePosixStart);
      assert.equal(seekablePosixEnd, nextSeekablePosixEnd);
    });

    it('returns a dynamic seekable range tracking wallclock time when the manifest contains time shift', () => {
      mock.timers.enable({ now: Date.parse('2025-11-04 09:00:00') });

      const manifestDocument = parseManifest(SAMPLE_SIMULCAST_MPD);

      const window = createSeekWindowFromManifest(manifestDocument);

      const [seekablePosixStart, seekablePosixEnd] = window.seekablePosixRange;

      const hourInMillis = 3600000;

      mock.timers.tick(hourInMillis);

      const [nextSeekablePosixStart, nextSeekablePosixEnd] = window.seekablePosixRange;

      assert.equal(seekablePosixStart + hourInMillis, nextSeekablePosixStart);
      assert.equal(seekablePosixEnd, nextSeekablePosixEnd);
    });

    [
      {
        now: Date.parse('2025-11-04 09:00:00'),
        posixTimeInMillis: Date.parse('2025-11-04 09:00:00'),
        presentationTimeInSeconds:
          (Date.parse('2025-11-04 09:00:00') - Date.parse('2025-10-28T11:00:01.920Z')) / 1000
      },
      {
        now: Date.parse('2025-11-04 09:00:00'),
        posixTimeInMillis: Date.parse('2025-10-28T11:00:01.920Z'),
        presentationTimeInSeconds: 0
      }
    ].forEach(({ now, posixTimeInMillis, presentationTimeInSeconds }) => {
      it(`converts posix time ${posixTimeInMillis} to presentation time ${presentationTimeInSeconds}`, () => {
        mock.timers.enable({ now });

        const manifestDocument = parseManifest(DYNAMIC_MPD);

        const window = createSeekWindowFromManifest(manifestDocument);

        assert.equal(
          window.getPresentationTimeFromPosixTime(posixTimeInMillis),
          presentationTimeInSeconds
        );
      });
    });

    it('handles simulcast manifests', () => {
      mock.timers.enable({ now: Date.parse('2025-11-04 09:00:00') });

      const simulcastManifest = parseManifest(SAMPLE_SIMULCAST_MPD);
      const simulcastBufferDepthSeconds = 2 * 60 * 60; // 2 hours
      const simulcastAvailabilityStartTime = new Date('1970-01-01T00:00:25Z');
      const liveOffset = simulcastAvailabilityStartTime.getTime();

      const window = createSeekWindowFromManifest(simulcastManifest);

      const [availableStart, availableEnd] = window.seekablePosixRange;

      const now = Date.now();

      assert.equal(availableStart, now - simulcastBufferDepthSeconds * 1000);
      assert.equal(availableEnd, now);
      assert.equal(
        window.getPresentationTimeFromPosixTime(availableStart),
        (now - simulcastBufferDepthSeconds * 1000 - liveOffset) / 1000
      );
      assert.equal(
        window.getPresentationTimeFromPosixTime(availableEnd),
        (now - liveOffset) / 1000
      );
    });

    it('handles webcast manifests', () => {
      mock.timers.enable({ now: Date.parse('2025-11-04 09:00:00') });

      const webcastManifest = parseManifest(SAMPLE_WEBCAST_MPD);
      const webcastBufferDepthSeconds = 2 * 60; // 2 minutes
      const webcastAvailabilityStartTime = new Date('2025-10-28T11:00:01.920Z');
      const liveOffset = webcastAvailabilityStartTime.getTime();

      const window = createSeekWindowFromManifest(webcastManifest);

      const now = Date.now();
      const [availableStart, availableEnd] = window.seekablePosixRange;

      assert.equal(availableStart, now - webcastBufferDepthSeconds * 1000);
      assert.equal(availableEnd, now);

      assert.equal(
        window.getPresentationTimeFromPosixTime(availableStart),
        (now - webcastBufferDepthSeconds * 1000 - liveOffset) / 1000
      );
      assert.equal(
        window.getPresentationTimeFromPosixTime(availableEnd),
        (now - liveOffset) / 1000
      );
    });
  });
});
