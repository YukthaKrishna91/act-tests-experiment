import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createSegmentTemplate } from './SegmentTemplate.js';

describe('SegmentTemplate', () => {
  describe('getInitSegment', () => {
    it.todo('returns the init segment');
  });

  describe('getMediaSegmentForTime', () => {
    it('returns the url to the media segment', () => {
      const template = createSegmentTemplate({
        baseUrl: 'mock://base.url/',
        duration: 3.84,
        initTemplate: '0.mp4',
        mediaTemplate: '$Number$.m4s'
      });

      assert.equal(template.getMediaSegmentForTime(60), 'mock://base.url/16.m4s');
    });
    it('pads the start of segment numbers', () => {
      const template = createSegmentTemplate({
        baseUrl: 'mock://base.url/',
        duration: 3.84,
        initTemplate: '000.mp4',
        mediaTemplate: '$Number%03d$.m4s'
      });

      assert.equal(template.getMediaSegmentForTime(6), 'mock://base.url/002.m4s');
    });
  });

  describe('getMediaSegments', () => {
    const baseUrl =
      'https://vod-uhd-uk-live.akamaized.net/tj54k7mq-pips-pid-p0ktp1tw/scmaf_abr_full_uhd/rd/';
    const duration = 3.84;
    const initTemplate = '$RepresentationID$/IS.mp4';
    const mediaTemplate = '$RepresentationID$/$Number%06d$.m4s';
    const representationId = '22fdd67d-5edf-5f02-75bd-cc3688e5a73c/video=18160000/dur=3840';
    const startNumber = 1;

    it('pads the start of segment numbers', () => {
      const segmentTemplate = createSegmentTemplate({
        baseUrl,
        duration,
        initTemplate,
        mediaTemplate,
        representationId,
        startNumber
      });

      assert.deepEqual(segmentTemplate.getMediaSegments([0, duration]), [
        'https://vod-uhd-uk-live.akamaized.net/tj54k7mq-pips-pid-p0ktp1tw/scmaf_abr_full_uhd/rd/22fdd67d-5edf-5f02-75bd-cc3688e5a73c/video=18160000/dur=3840/000001.m4s'
      ]);
    });

    it("doesn't pad the start when not neccessary", () => {
      const mediaTemplate = '$RepresentationID$/$Number$.m4s';

      const segmentTemplate = createSegmentTemplate({
        baseUrl,
        duration,
        initTemplate,
        mediaTemplate,
        representationId,
        startNumber
      });

      assert.deepEqual(segmentTemplate.getMediaSegments([0, duration]), [
        'https://vod-uhd-uk-live.akamaized.net/tj54k7mq-pips-pid-p0ktp1tw/scmaf_abr_full_uhd/rd/22fdd67d-5edf-5f02-75bd-cc3688e5a73c/video=18160000/dur=3840/1.m4s'
      ]);
    });
  });

  describe('getMediaSegmentsForTimeRange', () => {
    const baseUrl =
      'https://vod-uhd-uk-live.akamaized.net/tj54k7mq-pips-pid-p0ktp1tw/scmaf_abr_full_uhd/rd/';
    const duration = 3.84;
    const initTemplate = '$RepresentationID$/IS.mp4';
    const mediaTemplate = '$RepresentationID$/$Number%06d$.m4s';
    const representationId = '22fdd67d-5edf-5f02-75bd-cc3688e5a73c/video=18160000/dur=3840';
    const startNumber = 1;

    it('pads the start of segment numbers', () => {
      const segmentTemplate = createSegmentTemplate({
        baseUrl,
        duration,
        initTemplate,
        mediaTemplate,
        representationId,
        startNumber
      });

      assert.deepEqual(
        [...segmentTemplate.getMediaSegmentsForTimeRange([0, duration])],
        [
          'https://vod-uhd-uk-live.akamaized.net/tj54k7mq-pips-pid-p0ktp1tw/scmaf_abr_full_uhd/rd/22fdd67d-5edf-5f02-75bd-cc3688e5a73c/video=18160000/dur=3840/000001.m4s'
        ]
      );
    });

    it("doesn't pad the start when not neccessary", () => {
      const mediaTemplate = '$RepresentationID$/$Number$.m4s';

      const segmentTemplate = createSegmentTemplate({
        baseUrl,
        duration,
        initTemplate,
        mediaTemplate,
        representationId,
        startNumber
      });

      assert.deepEqual(
        [...segmentTemplate.getMediaSegmentsForTimeRange([0, duration])],
        [
          'https://vod-uhd-uk-live.akamaized.net/tj54k7mq-pips-pid-p0ktp1tw/scmaf_abr_full_uhd/rd/22fdd67d-5edf-5f02-75bd-cc3688e5a73c/video=18160000/dur=3840/1.m4s'
        ]
      );
    });
  });

  describe('getTimeRangeContaining', () => {
    it('returns the time range for the segment containing the provided time', () => {
      const template = createSegmentTemplate({
        baseUrl: 'mock://base.url/',
        duration: 3.84,
        initTemplate: '0.mp4',
        mediaTemplate: '$Number$.m4s'
      });

      assert.deepEqual(template.getTimeRangeContaining(20), [19.2, 23.04]);
    });

    it('rounds to 2dp by default', () => {
      const template = createSegmentTemplate({
        baseUrl: 'mock://base.url/',
        duration: 3.84,
        initTemplate: '0.mp4',
        mediaTemplate: '$Number$.m4s'
      });

      assert.deepEqual(template.getTimeRangeContaining(88, 0), [84.47999999999999, 88.32]);
      assert.deepEqual(template.getTimeRangeContaining(88), [84.48, 88.32]);

      assert.deepEqual(
        template.getTimeRangeContaining(1018, 0),
        [1017.5999999999999, 1021.4399999999999]
      );
      assert.deepEqual(template.getTimeRangeContaining(1018), [1017.6, 1021.4399999999999]);
    });
  });

  describe('getTimeRangesSpanning', () => {
    it('returns the time ranges for the segments spanning the provided time', () => {
      const template = createSegmentTemplate({
        baseUrl: 'mock://base.url/',
        duration: 3.84,
        initTemplate: '0.mp4',
        mediaTemplate: '$Number$.m4s'
      });

      assert.deepEqual(
        [...template.getTimeRangesSpanning([17, 21])],
        [
          [15.36, 19.2],
          [19.2, 23.04]
        ]
      );
    });

    it('rounds to 2dp by default', () => {
      const template = createSegmentTemplate({
        baseUrl: 'mock://base.url/',
        duration: 3.84,
        initTemplate: '0.mp4',
        mediaTemplate: '$Number$.m4s'
      });

      assert.deepEqual(
        [...template.getTimeRangesSpanning([285, 295], 0)],
        [
          [284.15999999999997, 287.99999999999994],
          [288, 291.84],
          [291.84, 295.67999999999995]
        ]
      );

      assert.deepEqual(
        [...template.getTimeRangesSpanning([285, 295])],
        [
          [284.16, 287.99999999999994],
          [288, 291.84],
          [291.84, 295.67999999999995]
        ]
      );
    });
  });
});
